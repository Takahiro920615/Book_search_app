本アプリのデモリンク：https://book-search-app-lac.vercel.app

** アプリのスクリーンショット
| ホーム画面 | お気に入り一覧 | 本詳細 |
|:---:|:---:|:---:|
| ![ホーム](./images/home.png) | ![お気に入り](./images/favorites.png) | ![詳細](./images/details.png) |

**技術スタック
**フロントエンド:** Typescript / Vite/ React / Vercel
**バックエンド:** Ruby on Rails 7.2.3 / MySQL / JWT認証　/ GoogleOAuth / Google Books API

** 作成理由
気になる本を簡単にリストアップできるアプリが欲しかったのが理由です。
amazonの買いカゴに入れておいたり、気になる本のブラウザページのURLを保存しておくこともできますが、
もっと簡単に検索してハートマークを押せば読みたい本の画像や簡易的な本情報を見ることができるようにしたかったのが主な理由です。

** 機能一覧
 - ログイン、ログアウト機能
 - Googleログイン機能
 - 本検索機能
 - 本お気に入り追加機能
 - 本詳細情報表示機能

** 設計の工夫
フロントエンドとバックエンドをViteとRailsで分けた理由
 - より安全にJWT認証を行える
 - GoogleBooksAPIキーを隠せる
 - DBでの本情報とユーザー情報の保管が前提のため

** 苦労した点
 - googleログイン認証を導入したこと
 - JWTトークンの認証機能
 - 2つのログイン方法を実装させる際にそれぞれで必要なコードの記載があったので、それぞれアプリ内で機能するようにコード修正をする点に時間がかかりました。

## ローカル起動手順
### 前提条件
 - Ruby 3.3.0 / Node 20.10.0 / MySQL 9.1.0

### セットアップ
git clone https://github.com/Takahiro920615/Book_search_app.git
```cd Book_search_app```
# バックエンド
```bundle install && rails db:setup && rails s```
# フロントエンド
```cd frontend && yarn install && yarn dev```

** Issueドリブン
Issue駆動で開発を進め、機能追加・バグ修正・セキュリティ対応を計12件のIssueで管理しています。
→ [Issueの一覧はこちら](https://github.com/Takahiro920615/Book_search_app/issues)

**開発期間
８ヶ月・Googleログイン機能の修正とJWTトークン認証エラーの修正に主にコミット数を使用しています。
それ以外ではユーザーホーム画面に動きをつけたり、本一覧ページ、本検索ページ、お気に入り本一覧ページを同じUI内でボタン1つで切り替えができるように繰り返し
改善しています。

**作者情報
https://github.com/Takahiro920615
