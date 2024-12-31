from django.urls import path, include
from . import views
from django.contrib import admin

urlpatterns = [
    path('', views.home, name='home'),
    path('sign_in/', views.sign_in_view, name='sign_in'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('check_login/', views.check_login_view, name='check_login'),
    path('update_profile/', views.update_profile_view, name='update_profile'),
    path('get_friends/', views.get_friends_view, name='get_friends'),
    path('add_friend/', views.add_friend_view, name='add_friend'),
    path('delete_friend/', views.delete_friend_view, name='delete_friend'),
    path('status/', views.status_view, name='status'),
    path('match_history/', views.match_history_view, name='match_history'),
	path('get_username_by_nickname/', views.get_username_by_nickname, name='get_username_by_nickname'),
	path('update_status_counter/', views.update_status_counter, name='update_status_counter'),
	path('record_game_history/', views.record_game_history, name='record_game_history'),
	path('callback/', views.callback_view, name='callback'),
    path('oauth/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('login42/', views.login_view42, name='login42'),
    path('logout42/', views.logout42, name='logout42'),
	path('verify-otp/', views.verify_otp_view, name='verify-otp'),
]