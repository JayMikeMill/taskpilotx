from django.db import migrations
from django.conf import settings


def create_default_actions(apps, schema_editor):
    Action = apps.get_model('actions', 'Action')
    
    default_actions = [
        {
            'name': 'Send Notification',
            'action_type': 'send_notification',
            'description': 'Send a notification to the user',
            'requires_config': True,
            'config_schema': {'message': 'string', 'urgency': 'string'}
        },
        {
            'name': 'Save Message',
            'action_type': 'save_message',
            'description': 'Save the message for later review',
            'requires_config': False,
            'config_schema': {}
        },
        {
            'name': 'Send Email',
            'action_type': 'send_email',
            'description': 'Send an email with specified content',
            'requires_config': True,
            'config_schema': {'to': 'string', 'subject': 'string', 'body': 'string'}
        },
        {
            'name': 'Trigger Task',
            'action_type': 'trigger_task',
            'description': 'Trigger another task to execute',
            'requires_config': True,
            'config_schema': {'task_id': 'integer'}
        },
        {
            'name': 'Upload Content',
            'action_type': 'upload_content',
            'description': 'Upload content to a specified location',
            'requires_config': True,
            'config_schema': {'destination': 'string', 'content': 'string'}
        }
    ]
    
    for action_data in default_actions:
        Action.objects.get_or_create(
            name=action_data['name'],
            defaults=action_data
        )


def remove_default_actions(apps, schema_editor):
    Action = apps.get_model('actions', 'Action')
    Action.objects.filter(
        name__in=[
            'Send Notification', 'Save Message', 'Send Email',
            'Trigger Task', 'Upload Content'
        ]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('actions', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_actions, remove_default_actions),
    ]