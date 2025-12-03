if Rails.env.production? || Rails.env.development?
  User.find_or_create_by!(email: "test@example.com") do |user|
    user.password = "password123"
    user.password_confirmation = "password123"
  end

  puts "Created test user: test@example.com / password123"
end
