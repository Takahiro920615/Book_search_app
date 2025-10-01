module Api
  module V1
    class FavoritesController < ApplicationController
      # CSRF保護を無効化（API用）
      skip_before_action :verify_authenticity_token
      before_action :authenticate_user!

      def index
        favorites = current_user.favorites.where(favorite: true).pluck(:book_id)
        render json: { book_ids: favorites }, status: :ok
      end

      def create
        book_id = params[:book_id]
        favorite = current_user.favorites.find_or_initialize_by(book_id: book_id)
        favorite.favorite = true
        if favorite.save
          render json: { message: 'お気に入りに追加しました', book_id: book_id }, status: :ok
        else
          render json: { error: favorite.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        book_id = params[:book_id]
        favorite = current_user.favorites.find_by(book_id: book_id, favorite: true)
        if favorite&.destroy
          render json: { message: 'お気に入りから削除しました', book_id: book_id }, status: :ok
        else
          render json: { error: 'お気に入りが見つかりません' }, status: :not_found
        end
      end
    end
  end
end