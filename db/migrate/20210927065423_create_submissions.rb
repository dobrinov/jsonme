class CreateSubmissions < ActiveRecord::Migration[6.1]
  def change
    create_table :submissions do |t|
      t.column :method, :submission_method, null: false
      t.string :name, null: false
      t.string :username, null: true

      t.timestamps
    end
  end
end
