class CreateSubmissionMethod < ActiveRecord::Migration[6.1]
  def up
    execute "CREATE TYPE submission_method AS ENUM ('github', 'gitlab', 'file', 'text');"
  end

  def down
    execute 'DROP TYPE submission_method;'
  end
end

