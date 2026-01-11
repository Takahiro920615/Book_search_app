Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "https://book-search-5zy90wiol-takahiro-shimatanis-projects.vercel.app", "https://*.vercel.app"
    resource "*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true   # cookie/JWT用
  end
end