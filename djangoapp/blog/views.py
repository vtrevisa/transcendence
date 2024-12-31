import logging
from django.core.mail import send_mail
from django.http import JsonResponse
from django_otp.plugins.otp_email.models import EmailDevice
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, get_user_model, login as auth_login, logout as auth_logout
from django.shortcuts import render, redirect  # Added redirect import
from .models import UserProfile, Match
import json
import random
import string
import requests
from django.conf import settings
from django.utils import timezone
from django.utils.translation import gettext as _
from django.core.mail import send_mail, BadHeaderError
from smtplib import SMTPException
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
import random
import string


User = get_user_model()
logger = logging.getLogger(__name__)
custom_logger = logging.getLogger('custom_logger')

@csrf_exempt
def sign_in_view(request):
    logger.debug("sign_in_view called")
    if request.method == 'POST':
        logger.debug("Request method is POST")
        username = request.POST.get('username')
        password = request.POST.get('password')
        email = request.POST.get('email')
        nickname = request.POST.get('nickname')
        avatar = request.FILES.get('avatar')
        
        logger.debug(f"Received data - Username: {username}, Password: {password}, Email: {email}, Nickname: {nickname}, Avatar: {avatar}")
        
        if User.objects.filter(username=username).exists():
            logger.debug("Username already exists")
            return JsonResponse({'success': False, 'message': 'Username already exists'})
        if User.objects.filter(username=nickname).exists():
            return JsonResponse({'success': False, 'message': 'Nickname already exists'})
        
        user = User.objects.create_user(username=username, password=password, email=email)
        logger.debug(f"User {username} created successfully")
        
        # Check if UserProfile already exists
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        user_profile.nickname = nickname
        user_profile.avatar = avatar
        user_profile.save()
        
        logger.debug(f"UserProfile for {username} created/updated successfully")
        
        return JsonResponse({'success': True})
    
    logger.debug("Invalid request method")
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if (user is not None):
            # Generate a random OTP
            otp = ''.join(random.choices(string.digits, k=6))
            device, created = EmailDevice.objects.get_or_create(user=user, name='default')
            device.token = otp
            device.save()
            # Send OTP via email
            try:
                # Send OTP via email
                print(user.email)
                send_mail(
                    'Your OTP Code',
                    f'Your OTP code is {otp}',
                    'vi.trevi.11@gmail.com',
                    [user.email],
                    fail_silently=False,
                )
                return JsonResponse({'message': 'OTP sent to your email'}, status=200)
            except BadHeaderError:
                return JsonResponse({'success': False, 'message': 'Invalid header found.'}, status=400)
            except SMTPException as e:
                logger.error(f"SMTP error: {str(e)}")
                return JsonResponse({'success': False, 'message': 'Error sending email. Please try again later.'}, status=500)
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}")
                return JsonResponse({'success': False, 'message': 'An unexpected error occurred. Please try again later.'}, status=500)

        return JsonResponse({'success': False, 'message': 'Invalid credentials'}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@api_view(['POST'])
def verify_otp_view(request):
    username = request.data.get('username')
    otp = request.data.get('otp')
    user = User.objects.get(username=username)
    device = EmailDevice.objects.get(user=user, name='default')

    # Log the expected OTP and the inputted OTP
    custom_logger.debug(f'Expected OTP: {device.token} for user: {user.username}')
    custom_logger.debug(f'Inputted OTP: {otp} for user: {user.username}')

    if ({device.token} == {otp}):
        refresh = RefreshToken.for_user(user)
        auth_login(request, user)
        user_profile = UserProfile.objects.get(user=user)
        user_profile.is_online = True
        user_profile.save()
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'email': user.email,
            'nickname': user_profile.nickname,
            'avatar_url': user_profile.avatar.url if user_profile.avatar else '/static/default_avatar.png'
        })
    return JsonResponse({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({'message': 'This is a protected view'}, status=status.HTTP_200_OK)

@csrf_exempt
@login_required
def logout_view(request):
    if request.method == 'POST':
        user_profile = UserProfile.objects.get(user=request.user)
        user_profile.is_online = False
        user_profile.save()
        auth_logout(request)
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
def check_login_view(request):
    user = request.user
    try:
        user_profile = UserProfile.objects.get(user=user)
        return JsonResponse({
            'logged_in': True,
            'username': user.username,
            'email': user.email,
            'nickname': user_profile.nickname,
            'avatar_url': user_profile.avatar.url if user_profile.avatar else '/static/default_avatar.png'
        })
    except UserProfile.DoesNotExist:
        return JsonResponse({'logged_in': False})

@csrf_exempt
@login_required
def update_profile_view(request):
    if request.method == 'POST':
        user = request.user
        user_profile = UserProfile.objects.get(user=user)
        
        email = request.POST.get('email')
        nickname = request.POST.get('nickname')
        avatar = request.FILES.get('avatar')
        
        if email:
            user.email = email
            user.save()
        
        if nickname:
            user_profile.nickname = nickname
        
        if avatar:
            user_profile.avatar = avatar
        
        user_profile.save()
        
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
def get_friends_view(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        friends = user_profile.friends.all()
        friends_list = [{'username': friend.user.username, 'nickname': friend.nickname, 'is_online': friend.is_online} for friend in friends]
        return JsonResponse({'friends': friends_list})
    except UserProfile.DoesNotExist:
        logger.error("User profile not found for user: %s", request.user.username)
        return JsonResponse({'success': False, 'message': 'User profile not found'}, status=404)
    except Exception as e:
        logger.error("Error fetching friends for user: %s, error: %s", request.user.username, str(e))
        return JsonResponse({'success': False, 'message': str(e)}, status=500)
    
@csrf_exempt
@login_required
def add_friend_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            if not username:
                return JsonResponse({'success': False, 'message': 'Username not provided'}, status=400)
            try:
                friend_user = User.objects.get(username=username)
                friend_profile = UserProfile.objects.get(user=friend_user)
            except User.DoesNotExist:
                return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
            user_profile = UserProfile.objects.get(user=request.user)
            if friend_profile in user_profile.friends.all():
                return JsonResponse({'success': False, 'message': 'User is already a friend'}, status=400)
            user_profile.friends.add(friend_profile)
            return JsonResponse({'success': True})
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
        except UserProfile.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'User profile not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
@login_required
def delete_friend_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            friend_username = data.get('username')
            logger.debug(f"Received request to delete friend: {friend_username}")

            friend_user = User.objects.get(username=friend_username)
            user_profile = UserProfile.objects.get(user=request.user)
            friend_profile = UserProfile.objects.get(user=friend_user)

            user_profile.friends.remove(friend_profile)
            logger.debug(f"Friend {friend_username} removed successfully")
            return JsonResponse({'success': True})
        except json.JSONDecodeError:
            logger.error("Invalid JSON")
            return JsonResponse({'success': False, 'message': 'Invalid JSON'}, status=400)
        except User.DoesNotExist:
            logger.error(f"User not found: {friend_username}")
            return JsonResponse({'success': False, 'message': 'User not found'}, status=404)
        except UserProfile.DoesNotExist:
            logger.error(f"User profile not found for user: {friend_username}")
            return JsonResponse({'success': False, 'message': 'User profile not found'}, status=404)
        except Exception as e:
            logger.error(f"Error deleting friend: {str(e)}")
            return JsonResponse({'success': False, 'message': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request method'}, status=400)

@login_required
def status_view(request):
    user_profile = UserProfile.objects.get(user=request.user)
    matches = user_profile.matches
    wins = user_profile.wins
    losses = user_profile.losses
    winrate = (wins / matches * 100) if matches > 0 else 0
    return JsonResponse({
        'matches': matches,
        'wins': wins,
        'losses': losses,
        'winrate': f'{winrate:.2f}%'
    })

@login_required
def match_history_view(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        matches = Match.objects.filter(player1=user_profile.user).order_by('-date')
        match_list = [{
            'id': match.id,
            'player1': {
                'username': match.player1.username,
                'nickname': user_profile.nickname,  # Assuming UserProfile has a nickname field
                'score': match.player1_score  # Assuming Match model has player1_score field
            },
            'player2': {
                'username': match.player2 if match.player2 else 'N/A',
                'nickname': match.player2_nickname if match.player2_nickname else 'N/A',  # Assuming Match model has player2_nickname field
                'score': match.player2_score  # Assuming Match model has player2_score field
            },
            'winner': match.winner,
            'date': match.date.strftime('%Y-%m-%d %H:%M:%S'),
            'details': match.details,
            'events': match.events  # Ensure events are included
        } for match in matches]
        return JsonResponse({'matches': match_list})
    except Exception as e:
        logger.error(f"Error fetching match history: {str(e)}")
        return JsonResponse({'message': str(e)}, status=500)

def get_username_by_nickname(request):
    nickname = request.GET.get('nickname')
    try:
        user_profile = UserProfile.objects.get(nickname=nickname)
        username = user_profile.user.username
        return JsonResponse({'username': username})
    except UserProfile.DoesNotExist:
        return JsonResponse({'username': None})

@csrf_exempt
def update_status_counter(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        result = data.get('result')

        try:
            user = User.objects.get(username=username)
            user_profile = UserProfile.objects.get(user=user)

            if result == 'won':
                user_profile.wins += 1
            elif result == 'lost':
                user_profile.losses += 1

            user_profile.matches += 1
            user_profile.save()

            return JsonResponse({'message': 'Status counter updated successfully'})
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)
        except UserProfile.DoesNotExist:
            return JsonResponse({'message': 'User profile not found'}, status=404)

    return JsonResponse({'message': 'Invalid request method'}, status=400)

@csrf_exempt
def record_game_history(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            player1_username = data.get('player1')['username']
            player2_nickname = data.get('player2')['nickname']
            winner = data.get('winner')
            match_time = data.get('date')
            match_score = data.get('details')
            match_id = data.get('id')  # Retrieve match ID
            events = data.get('events', [])  # Retrieve events

            player1 = User.objects.get(username=player1_username)

            winner_user = player1 if winner == player1_username else player2_nickname

            if winner_user is None:
                return JsonResponse({'message': 'Winner user is None'}, status=400)

            Match.objects.create(
                id=match_id,  # Store match ID
                player1=player1,
                player2=player2_nickname,
                winner=winner_user,
                date=match_time,
                details=match_score,
                events=events  # Store events
            )

            return JsonResponse({'message': 'Game history recorded successfully'})
        except User.DoesNotExist:
            return JsonResponse({'message': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'message': str(e)}, status=400)
    else:
        return JsonResponse({'message': 'Invalid request method'}, status=400)

@login_required
def get_match_data(request, match_id):
    match = get_object_or_404(Match, id=match_id)
    match_data = {
        'id': match.id,
        'player1': {
            'username': match.player1.username,
            'nickname': match.player1.userprofile.nickname,  # Assuming UserProfile has a nickname field
            'score': match.player1_score  # Assuming Match model has player1_score field
        },
        'player2': {
            'username': match.player2 if match.player2 else 'N/A',
            'nickname': match.player2_nickname if match.player2_nickname else 'N/A',  # Assuming Match model has player2_nickname field
            'score': match.player2_score  # Assuming Match model has player2_score field
        },
        'winner': match.winner,
        'date': match.date.strftime('%Y-%m-%d %H:%M:%S'),
        'details': match.details,
        'events': match.events  # Ensure events are included
    }
    return JsonResponse(match_data)

def login_view42(request):
    # Redireciona o usuário para a página de login da 42
    authorize_url = (
        f"https://api.intra.42.fr/oauth/authorize?client_id={settings.CLIENT_ID}"
        f"&redirect_uri={settings.REDIRECT_URI}&response_type=code&scope=public"
    )
    return redirect(authorize_url)


def logout42(request):
    auth_logout(request)
    return redirect('/')

def callback_view(request):
    if request.method == 'GET':
        code = request.GET.get('code')
        token_url = "https://api.intra.42.fr/oauth/token"
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.CLIENT_ID,
            'client_secret': settings.CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.REDIRECT_URI,
        }
        
        token_response = requests.post(token_url, data=token_data)
        token_json = token_response.json()
        access_token = token_json.get('access_token')

        user_info_url = "https://api.intra.42.fr/v2/me"
        user_info_response = requests.get(
            user_info_url, headers={'Authorization': f'Bearer {access_token}'}
        )
        user_info = user_info_response.json()

        try:
            user = User.objects.get(username=user_info['login'])
            if user.last_login is None:
                user.last_login = timezone.now()  # Set the last_login field if not set
                user.save()
        except User.DoesNotExist:
            password = "randompasswd"
            user = User(username=user_info['login'], email=user_info['email'])
            user.set_password(password)
            user.last_login = timezone.now()  # Set the last_login field
            user.save()
        
        # Ensure UserProfile is created if it does not exist
        user_profile, created = UserProfile.objects.get_or_create(user=user)
        if created:
            user_profile.nickname = user_info['login']
        user_profile.is_online = True
        user_profile.save()


        auth_login(request, user)

        return redirect('/')

    return JsonResponse({'success': False, 'message': 'Invalid request method'}, status=400)

def home(request):
    return render(request, 'home.html')