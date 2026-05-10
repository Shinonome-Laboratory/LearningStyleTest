const bcrypt = require('bcryptjs')

exports.seed = async function (knex) {
  await knex('respondents').del()
  await knex('questions').del()
  await knex('type_content').del()
  await knex('theories').del()
  await knex('settings').del()

  // ── Theory ──────────────────────────────────────────────────────────────
  await knex('theories').insert({
    id: 'kolb',
    name: JSON.stringify({ zh: 'Kolb 学习风格', en: 'Kolb Learning Style', ja: 'コルブ学習スタイル' }),
    dimensions: JSON.stringify(['CE', 'RO', 'AC', 'AE']),
    axes: JSON.stringify([
      { name: 'AC_CE', formula: 'AC - CE', label: { zh: '抽象-具体', en: 'Abstract-Concrete', ja: '抽象-具体' } },
      { name: 'AE_RO', formula: 'AE - RO', label: { zh: '主动-反思', en: 'Active-Reflective', ja: '積極-省察' } }
    ]),
    types: JSON.stringify(['converging', 'diverging', 'assimilating', 'accommodating'])
  })

  // ── Type Content ─────────────────────────────────────────────────────────
  const types = [
    {
      theory_id: 'kolb', type: 'converging',
      name: JSON.stringify({ zh: '聚合型', en: 'Converging', ja: '収束型' }),
      description: JSON.stringify({
        zh: '善于将抽象理论转化为实际解决方案，逻辑思维强，偏好技术性任务。',
        en: 'Skilled at applying theories to practical problems, strong logical thinking, prefers technical tasks.',
        ja: '抽象的な理論を実践的な解決策に変換するのが得意で、論理的思考力が強く、技術的なタスクを好む。'
      }),
      traits: JSON.stringify([
        { zh: '擅长解决具体技术性问题', en: 'Excels at solving specific technical problems', ja: '具体的な技術的問題の解決が得意' },
        { zh: '偏好实验、模拟与动手操作', en: 'Prefers experiments, simulations, and hands-on activities', ja: '実験・シミュレーション・実践的な活動を好む' },
        { zh: '善于做决策和寻找最优方案', en: 'Good at decision-making and finding optimal solutions', ja: '意思決定と最適解を見つけるのが得意' },
        { zh: '较少依赖他人，倾向独立思考', en: 'Less reliant on others, tends toward independent thinking', ja: '他者への依存が少なく、独立した思考を好む' }
      ]),
      suggestions: JSON.stringify([
        { zh: '多参与项目实践和案例研究，让理论落地', en: 'Engage in project work and case studies to ground theories in practice', ja: 'プロジェクト実践やケーススタディに参加し、理論を実践に活かす' },
        { zh: '尝试跨学科学习，拓宽解决问题的思路', en: 'Try interdisciplinary learning to broaden problem-solving perspectives', ja: '学際的な学習を試みて、問題解決の視野を広げる' },
        { zh: '主动寻求反馈，避免过于执着于单一方案', en: 'Actively seek feedback to avoid fixating on a single solution', ja: 'フィードバックを積極的に求め、一つの解決策への固執を避ける' }
      ])
    },
    {
      theory_id: 'kolb', type: 'diverging',
      name: JSON.stringify({ zh: '发散型', en: 'Diverging', ja: '拡散型' }),
      description: JSON.stringify({
        zh: '富有想象力和创造力，善于从多角度观察问题，情感丰富，重视人际关系。',
        en: 'Imaginative and creative, good at viewing problems from multiple perspectives, emotionally rich, values relationships.',
        ja: '想像力と創造力が豊かで、多角的な視点から問題を観察するのが得意。感情豊かで人間関係を大切にする。'
      }),
      traits: JSON.stringify([
        { zh: '善于头脑风暴，能从多个角度思考问题', en: 'Good at brainstorming, can think from multiple angles', ja: 'ブレインストーミングが得意で、多角的に問題を考えられる' },
        { zh: '对人文和艺术感兴趣，情感感知力强', en: 'Interested in humanities and arts, strong emotional perception', ja: '人文・芸術に興味があり、感情的な知覚力が高い' },
        { zh: '善于倾听，能理解他人的不同观点', en: 'Good listener, can understand others\' different perspectives', ja: '傾聴が得意で、他者の異なる視点を理解できる' },
        { zh: '在小组学习和讨论中表现突出', en: 'Excels in group learning and discussions', ja: 'グループ学習やディスカッションで優れたパフォーマンスを発揮する' }
      ]),
      suggestions: JSON.stringify([
        { zh: '利用思维导图和可视化工具整理思路', en: 'Use mind maps and visual tools to organize ideas', ja: 'マインドマップや視覚化ツールを使ってアイデアを整理する' },
        { zh: '多参与小组讨论和协作学习，发挥人际优势', en: 'Participate in group discussions and collaborative learning to leverage interpersonal strengths', ja: 'グループディスカッションや協働学習に参加し、対人スキルを活かす' },
        { zh: '尝试建立更多结构化的学习计划，避免想法过于分散', en: 'Try building more structured study plans to avoid scattered thinking', ja: 'より構造化された学習計画を立てて、思考が分散しないようにする' }
      ])
    },
    {
      theory_id: 'kolb', type: 'assimilating',
      name: JSON.stringify({ zh: '同化型', en: 'Assimilating', ja: '同化型' }),
      description: JSON.stringify({
        zh: '擅长将大量信息整合为简洁的逻辑模型，偏好理论推导，重视概念的严谨性。',
        en: 'Skilled at integrating large amounts of information into concise logical models, prefers theoretical reasoning, values conceptual rigor.',
        ja: '大量の情報を簡潔な論理モデルに統合するのが得意で、理論的推論を好み、概念の厳密さを重視する。'
      }),
      traits: JSON.stringify([
        { zh: '善于构建理论框架和概念模型', en: 'Good at constructing theoretical frameworks and conceptual models', ja: '理論的枠組みと概念モデルの構築が得意' },
        { zh: '偏好阅读、讲座和系统性分析', en: 'Prefers reading, lectures, and systematic analysis', ja: '読書・講義・体系的な分析を好む' },
        { zh: '重视知识的逻辑性和一致性', en: 'Values the logic and consistency of knowledge', ja: '知識の論理性と一貫性を重視する' },
        { zh: '在科学和数学领域往往表现优秀', en: 'Often excels in science and mathematics', ja: '科学と数学の分野で優れたパフォーマンスを発揮することが多い' }
      ]),
      suggestions: JSON.stringify([
        { zh: '在学习后尝试用自己的话总结知识点，检验理解深度', en: 'After learning, summarize key points in your own words to test depth of understanding', ja: '学習後に自分の言葉で要点をまとめ、理解の深さを確認する' },
        { zh: '多结合实际案例学习，避免理论与实践脱节', en: 'Combine learning with real cases to avoid disconnection between theory and practice', ja: '実際のケースと組み合わせて学習し、理論と実践の乖離を避ける' },
        { zh: '主动与他人分享自己的理解，在讨论中深化认知', en: 'Actively share your understanding with others to deepen knowledge through discussion', ja: '積極的に自分の理解を他者と共有し、議論を通じて認識を深める' }
      ])
    },
    {
      theory_id: 'kolb', type: 'accommodating',
      name: JSON.stringify({ zh: '适应型', en: 'Accommodating', ja: '適応型' }),
      description: JSON.stringify({
        zh: '行动力强，勇于冒险，善于在实践中学习，依靠直觉和他人的信息做决策。',
        en: 'Action-oriented, risk-taking, good at learning through practice, relies on intuition and others\' information for decisions.',
        ja: '行動力が高く、リスクを恐れず、実践を通じた学習が得意。直感と他者の情報を頼りに意思決定する。'
      }),
      traits: JSON.stringify([
        { zh: '行动力强，善于执行计划和完成任务', en: 'Strong action-orientation, good at executing plans and completing tasks', ja: '行動力が高く、計画の実行とタスクの完了が得意' },
        { zh: '适应新环境能力强，面对变化时保持灵活', en: 'Strong adaptability to new environments, flexible when facing change', ja: '新しい環境への適応力が高く、変化に対して柔軟に対応する' },
        { zh: '乐于尝试新事物，不怕犯错', en: 'Enjoy trying new things and unafraid of making mistakes', ja: '新しいことに挑戦することを楽しみ、失敗を恐れない' },
        { zh: '善于与人合作，依靠团队完成复杂目标', en: 'Good at collaborating with others to achieve complex goals through teamwork', ja: '他者との協働が得意で、チームで複雑な目標を達成する' }
      ]),
      suggestions: JSON.stringify([
        { zh: '在行动前花一点时间分析风险，提高决策质量', en: 'Take time to analyze risks before acting to improve decision quality', ja: '行動する前にリスクを分析する時間を取り、意思決定の質を向上させる' },
        { zh: '培养记录和反思习惯，从每次实践中总结经验', en: 'Develop habits of recording and reflection to learn from each experience', ja: '記録と振り返りの習慣を身に付け、各経験から学びを得る' },
        { zh: '学习理论工具辅助直觉决策，减少依赖他人信息', en: 'Learn theoretical tools to support intuitive decisions and reduce reliance on others\' information', ja: '直感的な意思決定をサポートするための理論的ツールを学び、他者の情報への依存を減らす' }
      ])
    }
  ]
  await knex('type_content').insert(types)

  // ── Questions (12 forced-choice, 4 options per question, one per dimension)
  // zh: 强迫选择格式 — 每题只能选一个最符合自己的选项，有效防止社会期望偏差
  // en: Forced-choice format — select the ONE best-fitting option; reduces social desirability bias
  // ja: 強制選択形式 — 最も自分に当てはまる選択肢を1つだけ選ぶ。社会的望ましさバイアスを抑制

  const questions = [
    {
      id: 'kolb-q01', theory_id: 'kolb', order_num: 1,
      stem: JSON.stringify({ zh: '学到一个新概念时，我通常会：', en: 'When I encounter a new concept, I usually:', ja: '新しい概念に出会ったとき、私は通常：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '凭借以往类似的经历来理解它', en: 'Relate it to similar experiences I have had', ja: '以前の似た経験と関連付けて理解しようとする' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '仔细思考它在不同情境下的含义', en: 'Think carefully about its meaning in different contexts', ja: 'さまざまな文脈での意味をじっくり考える' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '梳理它与其他知识点的逻辑关系', en: 'Map out its logical connections to other knowledge', ja: '他の知識との論理的なつながりを整理する' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '立刻找机会把它用到实践中', en: 'Immediately look for an opportunity to apply it', ja: 'すぐにそれを実践に活かせる機会を探す' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q02', theory_id: 'kolb', order_num: 2,
      stem: JSON.stringify({ zh: '面对一个从未见过的难题，我倾向于：', en: 'When facing a problem I have never seen before, I tend to:', ja: 'これまでに見たことのない難問に直面したとき、私は：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '凭直觉和经验先做出判断', en: 'Make a judgment based on my intuition and experience first', ja: '直感と経験をもとにまず判断を下す' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '先观察和搜集足够信息再决定', en: 'Observe and gather enough information before deciding', ja: '観察し、十分な情報を集めてから決断する' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '分析问题的逻辑结构，推导出解法', en: 'Analyze the logical structure and reason toward a solution', ja: '論理構造を分析し、解法を導き出す' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '直接尝试多种方法，从试错中找答案', en: 'Try different approaches directly and learn by trial and error', ja: 'さまざまな方法を試し、試行錯誤の中から答えを見つける' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q03', theory_id: 'kolb', order_num: 3,
      stem: JSON.stringify({ zh: '在小组合作学习中，我通常扮演的角色是：', en: 'In group collaborative learning, my usual role is:', ja: 'グループ学習での私の通常の役割は：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '活跃气氛、分享个人经历与感受', en: 'Energize the group and share personal experiences and feelings', ja: '場を盛り上げ、個人的な経験や感情を共有する' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '倾听各方观点，综合整理大家的想法', en: 'Listen to all perspectives and synthesize everyone\'s ideas', ja: '各方面の意見を聴き、全員の考えを統合する' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '构建理论框架，保证讨论有逻辑', en: 'Build a theoretical framework to keep the discussion logical', ja: '理論的な枠組みを構築し、議論の論理を維持する' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '推动小组付诸行动，落实计划', en: 'Drive the group toward action and implementation', ja: 'グループを行動に向けて推進し、計画を実行する' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q04', theory_id: 'kolb', order_num: 4,
      stem: JSON.stringify({ zh: '评价一种学习方法好不好，我最看重：', en: 'When evaluating a learning method, I care most about whether it:', ja: '学習方法を評価するとき、私が最も重視するのは：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '能调动情感投入，让我有真实的参与感', en: 'Engages my emotions and gives me a genuine sense of involvement', ja: '感情的な関与を促し、本当の参加感があるかどうか' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '给我足够的时间思考和消化内容', en: 'Gives me enough time to think and absorb the content', ja: '内容を考え、消化するための十分な時間が与えられるかどうか' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '有清晰的理论依据和系统性', en: 'Has clear theoretical grounding and is systematic', ja: '明確な理論的根拠があり、体系的かどうか' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '能帮我快速将知识转化为可见的成果', en: 'Helps me quickly convert knowledge into visible results', ja: '知識を素早く目に見える成果に転換できるかどうか' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q05', theory_id: 'kolb', order_num: 5,
      stem: JSON.stringify({ zh: '开始学习一门新课程时，我通常会：', en: 'When starting a new course, I usually:', ja: '新しい授業を始めるとき、私は通常：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '寻找与自己生活经验相关的切入点', en: 'Look for connections to my own life experiences', ja: '自分の生活経験と関連する切り口を探す' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '大量阅读相关资料，形成整体印象', en: 'Read extensively to form an overall picture', ja: '大量の関連資料を読んで全体像をつかむ' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '梳理课程的知识体系和原理框架', en: 'Map out the knowledge system and underlying framework', ja: '授業の知識体系と基本原理の枠組みを整理する' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '尽早开始做练习题或动手项目', en: 'Start doing exercises or hands-on projects as early as possible', ja: '練習問題や実践プロジェクトをできるだけ早く始める' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q06', theory_id: 'kolb', order_num: 6,
      stem: JSON.stringify({ zh: '学习过程中遇到困惑时，我首选的方式是：', en: 'When I get confused during learning, my preferred approach is:', ja: '学習中に困惑したとき、私が好む方法は：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '向有亲身经验的人请教，结合实例理解', en: 'Ask someone with hands-on experience and learn through examples', ja: '実体験のある人に聞き、具体例を通じて理解する' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '安静下来，独自反复思考直到想通', en: 'Sit quietly alone and think it through until it clicks', ja: '一人で静かに、腑に落ちるまで繰り返し考える' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '查阅权威资料，从理论层面彻底弄清楚', en: 'Consult authoritative sources to understand it theoretically', ja: '権威ある資料を参照し、理論的に完全に理解する' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '直接动手操作，在实践中找到答案', en: 'Try it out directly and find the answer through practice', ja: '直接試してみて、実践の中で答えを見つける' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q07', theory_id: 'kolb', order_num: 7,
      stem: JSON.stringify({ zh: '当学到的内容与我原来的理解不符时，我会：', en: 'When what I have learned conflicts with my prior understanding, I:', ja: '学んだ内容が以前の理解と一致しないとき、私は：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '回想自己是否有类似的亲身经历可以参照', en: 'Recall whether I have similar personal experiences to draw on', ja: '類似した体験が自分にないか思い返す' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '暂停下来，重新审视自己对整件事的理解', en: 'Pause and reassess my whole understanding of the matter', ja: '立ち止まって、物事全体への自分の理解を見直す' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '重新检查推理过程，找出逻辑上的偏差', en: 'Review my reasoning process to find logical errors', ja: '推論のプロセスを再確認し、論理的な誤りを探す' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '通过实验或测试来验证哪种理解更准确', en: 'Run an experiment or test to verify which understanding is correct', ja: '実験やテストを通じてどちらの理解が正しいか確かめる' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q08', theory_id: 'kolb', order_num: 8,
      stem: JSON.stringify({ zh: '回顾一次学习经历，我最在意的是：', en: 'When reflecting on a learning experience, what I care about most is:', ja: '学習経験を振り返るとき、私が最も気にするのは：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '这次经历给我留下了什么感受和印象', en: 'What feelings and impressions this experience left on me', ja: 'その経験が残してくれた感覚や印象' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '我从中发现了哪些之前忽视的细节', en: 'What details I had previously overlooked', ja: '以前は見落としていた細部をどれだけ発見できたか' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '这次学习是否帮我建立了更完整的知识体系', en: 'Whether it helped me build a more complete knowledge system', ja: 'その学習が知識体系をより完全にしてくれたかどうか' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '我从中获得了多少可以直接应用的技能', en: 'How many directly applicable skills I gained from it', ja: 'そこから直接応用できるスキルをどれだけ得たか' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q09', theory_id: 'kolb', order_num: 9,
      stem: JSON.stringify({ zh: '最能让我进入学习状态的环境是：', en: 'The environment that best gets me into a learning state is:', ja: '最も学習状態に入りやすい環境は：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '有互动、气氛活跃、大家能互相分享', en: 'Interactive and lively, where people share with each other', ja: 'インタラクティブで活気があり、互いに共有できる場' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '安静独立，可以专注思考和观察', en: 'Quiet and independent, allowing focused thinking and observation', ja: '静かで独立しており、集中して考え、観察できる場' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '有结构清晰的大纲和系统的学习材料', en: 'A clearly structured outline with systematic learning materials', ja: '明確に構造化されたアウトラインと体系的な学習教材がある場' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '有真实任务或挑战，可以边做边学', en: 'Real tasks or challenges where I can learn by doing', ja: '本物のタスクや課題があり、やりながら学べる場' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q10', theory_id: 'kolb', order_num: 10,
      stem: JSON.stringify({ zh: '做完一项学习任务后，我通常会：', en: 'After completing a learning task, I typically:', ja: '学習課題を終えた後、私は通常：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '和别人聊聊这次的体验和感想', en: 'Talk to someone about the experience and my thoughts', ja: 'その体験や感想について誰かと話す' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '独自回顾整个过程，总结经验教训', en: 'Quietly review the process and summarize lessons learned', ja: '一人でプロセス全体を振り返り、経験をまとめる' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '检验结果是否符合理论预期', en: 'Check whether the results match theoretical expectations', ja: '結果が理論的な予測と一致しているか確認する' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '马上思考下一步可以把它应用在哪里', en: 'Immediately think about where I can apply it next', ja: 'すぐにどこに活かせるかを考える' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q11', theory_id: 'kolb', order_num: 11,
      stem: JSON.stringify({ zh: '老师用多种方式讲同一个知识点时，我最容易接受的是：', en: 'When a teacher presents the same concept in multiple ways, I find it easiest to learn through:', ja: '教師が同じ内容を複数の方法で提示したとき、最も理解しやすいのは：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '生动的故事、案例或现实生活中的例子', en: 'Vivid stories, cases, or real-life examples', ja: '生き生きとしたストーリー、事例、または実生活の例' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '多角度对比分析，让我深入思考', en: 'Multi-angle comparative analysis that prompts deeper thinking', ja: '多角的な比較分析で深く考えられるもの' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '严密的理论推导和清晰的概念定义', en: 'Rigorous theoretical derivation and clear conceptual definitions', ja: '厳密な理論的推論と明確な概念定義' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '手把手示范操作，或让我直接动手尝试', en: 'Hands-on demonstration or letting me try it directly', ja: '実演してみせるか、自分で直接試させてくれるもの' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    },
    {
      id: 'kolb-q12', theory_id: 'kolb', order_num: 12,
      stem: JSON.stringify({ zh: '我认为最理想的学习成果是：', en: 'I believe the most ideal learning outcome is:', ja: '最も理想的な学習成果は：' }),
      options: JSON.stringify([
        { key: 'A', text: { zh: '形成了个人独到的体验和感悟', en: 'Having formed personal, unique insights and experiences', ja: '個人的な独自の洞察と経験が形成されたこと' }, scores: { CE: 3, RO: 0, AC: 0, AE: 0 } },
        { key: 'B', text: { zh: '深刻理解了事物背后的规律和意义', en: 'Having deeply understood the patterns and meaning behind things', ja: '物事の背後にある法則と意味を深く理解したこと' }, scores: { CE: 0, RO: 3, AC: 0, AE: 0 } },
        { key: 'C', text: { zh: '建立了系统的理论框架和逻辑认知', en: 'Having built a systematic theoretical framework and logical understanding', ja: '系統的な理論的枠組みと論理的認識が構築されたこと' }, scores: { CE: 0, RO: 0, AC: 3, AE: 0 } },
        { key: 'D', text: { zh: '掌握了可以实际操作的具体技能', en: 'Having mastered concrete, practically applicable skills', ja: '実際に応用できる具体的なスキルを習得したこと' }, scores: { CE: 0, RO: 0, AC: 0, AE: 3 } }
      ])
    }
  ]

  await knex('questions').insert(questions.map(q => ({
    id: q.id,
    theory_id: q.theory_id,
    order_num: q.order_num,
    stem: q.stem,
    options: q.options
  })))

  // ── Settings ─────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('admin123', 10)
  await knex('settings').insert([
    { key: 'admin_password', value: hash },
    {
      key: 'info_fields',
      value: JSON.stringify([
        { name: { zh: '姓名', en: 'Name', ja: '氏名' }, type: 'text', required: true },
        { name: { zh: '学号', en: 'Student ID', ja: '学籍番号' }, type: 'text', required: true }
      ])
    }
  ])
}
