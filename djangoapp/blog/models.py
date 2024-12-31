from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver
from django.utils import timezone

class Match(models.Model):
    id = models.CharField(max_length=100, primary_key=True)
    player1 = models.ForeignKey(User, related_name='matches_as_player1', on_delete=models.CASCADE)
    player2 = models.CharField(max_length=100, null=True, blank=True)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    player2_nickname = models.CharField(max_length=100, null=True, blank=True)
    winner = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField(default=timezone.now)
    details = models.TextField(blank=True)
    events = models.JSONField(default=list, blank=True)  # Assuming events are stored as JSON

    def __str__(self):
        return f"Match between {self.player1} and {self.player2 or 'N/A'} on {self.date}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nickname = models.CharField(max_length=100)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    matches = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    match_history = models.ManyToManyField(Match, related_name='user_profiles', blank=True)
    friends = models.ManyToManyField('self', blank=True)
    is_online = models.BooleanField(default=False)

    def __str__(self):
        return self.nickname

    def record_win(self, match):
        self.wins += 1
        self.matches += 1
        self.match_history.add(match)
        self.save()

    def record_loss(self, match):
        self.losses += 1
        self.matches += 1
        self.match_history.add(match)
        self.save()

@receiver(post_delete, sender=User)
def delete_user_profile(sender, instance, **kwargs):
    try:
        instance.userprofile.delete()
    except UserProfile.DoesNotExist:
        pass

@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    else:
        try:
            instance.userprofile.save()
        except UserProfile.DoesNotExist:
            UserProfile.objects.create(user=instance)