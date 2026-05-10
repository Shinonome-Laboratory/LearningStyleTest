<!--
  zh: Kolb 坐标轴图表（单人模式 + 多人散点模式），含入场动画
  en: Kolb coordinate chart (single / multi-person) with entrance animation
  ja: コルブ座標チャート（単人・複数人モード）、入場アニメーション付き

  Props:
    acCe   — AC-CE 轴值（单人模式）
    aeRo   — AE-RO 轴值（单人模式）
    points — 多人数据 [{id, AC_CE, AE_RO, type, label}]（多人模式）
    small  — 小尺寸（用于抽屉，240px 高）
-->
<template>
  <div class="chart-card" :class="{ small }">
    <div ref="chartEl" class="chart-el" />
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
  acCe:   { type: Number, default: 0 },
  aeRo:   { type: Number, default: 0 },
  points: { type: Array,  default: null },
  small:  { type: Boolean, default: false }
})

const emit = defineEmits(['pointClick'])
const chartEl = ref(null)
let chart = null
let resizeObserver = null

const TYPE_COLORS = {
  converging:    '#4A90B8',
  assimilating:  '#9B59B6',
  diverging:     '#E67E22',
  accommodating: '#27AE60'
}

const QUAD_FILL = {
  converging:    'rgba(74,144,184,0.09)',
  assimilating:  'rgba(155,89,182,0.09)',
  diverging:     'rgba(230,126,34,0.09)',
  accommodating: 'rgba(39,174,96,0.09)'
}

// zh: 动态计算坐标轴范围，不硬编码 ±36
// en: Dynamically compute axis range, no hardcoded ±36
// ja: 軸の範囲を動的に計算し、±36をハードコードしない
function calcRange() {
  const isMulti = Array.isArray(props.points) && props.points.length > 0
  let peak = 10
  if (isMulti) {
    for (const p of props.points) {
      peak = Math.max(peak, Math.abs(p.AC_CE), Math.abs(p.AE_RO))
    }
  } else {
    peak = Math.max(10, Math.abs(props.acCe), Math.abs(props.aeRo))
  }
  return Math.ceil(peak * 1.35)
}

function buildOption() {
  const isMulti = Array.isArray(props.points) && props.points.length > 0
  const R = calcRange()

  // zh: 四象限定义：[类型, x1, x2, y1, y2, 标签x, 标签y]
  // en: Quadrant config: [type, x1, x2, y1, y2, labelX, labelY]
  // ja: 四象限設定
  const quads = [
    ['converging',    0,  R,  0,  R,  R * 0.52,  R * 0.58],
    ['assimilating', -R,  0,  0,  R, -R * 0.52,  R * 0.58],
    ['diverging',    -R,  0, -R,  0, -R * 0.52, -R * 0.58],
    ['accommodating', 0,  R, -R,  0,  R * 0.52, -R * 0.58],
  ]

  const markAreaData = quads.map(([type, x1, x2, y1, y2]) => [
    { xAxis: x1, yAxis: y1, itemStyle: { color: QUAD_FILL[type] } },
    { xAxis: x2, yAxis: y2 }
  ])

  // zh: 用 symbolSize:0 的幽灵系列在各象限中心显示类型标签
  // en: Ghost scatter series (invisible points) for centered quadrant labels
  // ja: 各象限の中心にタイプラベルを表示するゴースト散布図シリーズ
  const labelSeries = quads.map(([type, , , , , lx, ly]) => ({
    type: 'scatter',
    symbolSize: 0,
    silent: true,
    animation: false,
    tooltip: { show: false },
    z: 1,
    data: [{ value: [lx, ly] }],
    label: {
      show: true,
      formatter: t(`test.result.axis.${type}`),
      color: TYPE_COLORS[type],
      fontSize: props.small ? 10 : 12,
      fontWeight: 'bold',
      opacity: 0.45
    }
  }))

  // zh: 主数据系列（单人用 effectScatter 波纹，多人用普通 scatter）
  // en: Main data series (effectScatter ripple for single, scatter for multi)
  // ja: メインデータシリーズ
  let mainSeries
  if (isMulti) {
    mainSeries = Object.entries(TYPE_COLORS).map(([type, color]) => ({
      name: t(`test.result.axis.${type}`),
      type: 'scatter',
      symbolSize: 11,
      itemStyle: { color, opacity: 0.88 },
      emphasis: {
        scale: true,
        itemStyle: { shadowBlur: 12, shadowColor: color }
      },
      animationDelay: (idx) => idx * 12,
      data: props.points
        .filter(p => p.type === type)
        .map(p => ({ value: [p.AE_RO, p.AC_CE], id: p.id, label: p.label }))
    }))
    mainSeries[0].markArea = { silent: true, data: markAreaData }
  } else {
    mainSeries = [{
      type: 'effectScatter',
      symbolSize: 18,
      rippleEffect: { brushType: 'stroke', scale: 2.6, period: 3 },
      itemStyle: { color: '#E74C3C' },
      data: [{ value: [props.aeRo, props.acCe] }],
      label: {
        show: !props.small,
        formatter: t('test.result.axis.you'),
        position: 'right',
        color: '#E74C3C',
        fontSize: 13,
        fontWeight: 'bold',
        distance: 10
      },
      markArea: { silent: true, data: markAreaData }
    }]
  }

  const axisBase = {
    min: -R, max: R,
    splitLine: { show: false },
    axisLine: { onZero: true, lineStyle: { color: '#c8c8c8', width: 2 } },
    axisTick: { show: false },
    axisLabel: { show: false }
  }

  return {
    animation: true,
    animationDuration: 700,
    animationEasing: 'cubicOut',

    grid: { top: 44, right: 44, bottom: isMulti ? 80 : 46, left: 52 },

    tooltip: {
      show: isMulti,
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e4e4e4',
      borderWidth: 1,
      padding: [8, 12],
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params) => {
        if (!params.data?.label) return ''
        const [x, y] = params.data.value
        return `<strong>${params.data.label}</strong><br/>AE−RO: ${x}<br/>AC−CE: ${y}`
      }
    },

    legend: isMulti ? {
      bottom: 4,
      itemWidth: 9, itemHeight: 9, itemGap: 14,
      data: Object.entries(TYPE_COLORS).map(([type, color]) => ({
        name: t(`test.result.axis.${type}`),
        itemStyle: { color }
      })),
      textStyle: { fontSize: 11, color: '#777' }
    } : undefined,

    xAxis: {
      ...axisBase,
      name: `← ${t('test.result.axis.reflective')}   ${t('test.result.axis.active')} →`,
      nameLocation: 'center',
      nameGap: 28,
      nameTextStyle: { color: '#aaa', fontSize: 11 }
    },

    yAxis: {
      ...axisBase,
      name: `← ${t('test.result.axis.concrete')}  /  ${t('test.result.axis.abstract')} →`,
      nameLocation: 'center',
      nameGap: 38,
      nameTextStyle: { color: '#aaa', fontSize: 11 }
    },

    series: [...labelSeries, ...mainSeries]
  }
}

onMounted(() => {
  chart = echarts.init(chartEl.value)
  chart.setOption(buildOption())
  chart.on('click', (params) => {
    if (params.data?.id) emit('pointClick', params.data.id)
  })
  // zh: 用 ResizeObserver 监听容器尺寸变化，解决 tab 切换时图表尺寸为 0 的问题
  resizeObserver = new ResizeObserver(() => chart?.resize())
  resizeObserver.observe(chartEl.value)
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
})

watch(
  () => [props.acCe, props.aeRo, props.points, locale.value],
  () => chart?.setOption(buildOption(), true),
  { deep: true }
)
</script>

<style scoped>
.chart-card {
  background: #fff;
  border-radius: 14px;
  padding: 6px;
  box-shadow: 0 4px 24px rgba(74, 144, 184, 0.13);
}
.chart-el {
  width: 100%;
  height: 380px;
}
.chart-card.small .chart-el {
  height: 240px;
}
</style>
