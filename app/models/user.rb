class User < ActiveRecord::Base
  attr_accessible :email


  private

  def create_remember_token
    # Create the token.
  end
end
