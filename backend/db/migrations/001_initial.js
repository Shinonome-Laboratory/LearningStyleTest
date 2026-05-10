exports.up = function (knex) {
  return knex.schema
    .createTable('theories', t => {
      t.string('id').primary()
      t.text('name').notNullable()       // JSON {zh,en,ja}
      t.text('dimensions').notNullable() // JSON array
      t.text('axes').notNullable()       // JSON array
      t.text('types').notNullable()      // JSON array
    })
    .createTable('type_content', t => {
      t.increments('id')
      t.string('theory_id').notNullable().references('id').inTable('theories')
      t.string('type').notNullable()
      t.text('name').notNullable()        // JSON {zh,en,ja}
      t.text('description').notNullable() // JSON {zh,en,ja}
      t.text('traits').notNullable()      // JSON array of {zh,en,ja}
      t.text('suggestions').notNullable() // JSON array of {zh,en,ja}
    })
    .createTable('questions', t => {
      t.increments('id')
      t.string('theory_id').notNullable().references('id').inTable('theories')
      t.integer('order_num').notNullable()
      t.text('stem').notNullable()    // JSON {zh,en,ja}
      t.text('options').notNullable() // JSON array [{key,text:{zh,en,ja},scores:{CE,RO,AC,AE}}]
    })
    .createTable('respondents', t => {
      t.string('id').primary()
      t.string('theory_id').notNullable()
      t.string('lang').notNullable()
      t.text('info').notNullable()    // JSON object
      t.text('scores').notNullable()  // JSON {CE,RO,AC,AE}
      t.text('axes').notNullable()    // JSON {AC_CE,AE_RO}
      t.string('type').notNullable()
      t.text('vector').notNullable()  // JSON array
      t.text('answers').notNullable() // JSON array [{question_id, option_key}]
      t.string('created_at').notNullable()
    })
    .createTable('settings', t => {
      t.string('key').primary()
      t.text('value').notNullable()
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('respondents')
    .dropTableIfExists('questions')
    .dropTableIfExists('type_content')
    .dropTableIfExists('theories')
    .dropTableIfExists('settings')
}
