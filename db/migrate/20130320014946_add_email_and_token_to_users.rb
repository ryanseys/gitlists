class AddEmailAndTokenToUsers < ActiveRecord::Migration
  def change
    add_column :users, :email, :string
    add_column :users, :token, :string
  end
end
