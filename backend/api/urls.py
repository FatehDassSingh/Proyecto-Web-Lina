from django.urls import path
from . import views

urlpatterns = [
    path('menu/', views.get_menu, name='get_menu'),
    path('communes/', views.get_communes, name='get_communes'),
    path('coupons/lead/', views.capture_lead_coupon, name='capture_lead_coupon'),
    path('coupons/validate/', views.validate_coupon, name='validate_coupon'),
    path('orders/check_availability/', views.check_availability, name='check_availability'),
    path('orders/unavailable_dates/', views.get_unavailable_dates, name='get_unavailable_dates'),
    path('orders/', views.create_order, name='create_order'),
    path('orders/<int:order_id>/upload_voucher/', views.upload_transfer_voucher, name='upload_transfer_voucher'),
    path('admin/orders/', views.admin_orders, name='admin_orders'),
    path('admin/leads/', views.admin_leads, name='admin_leads'),
    path('admin/categories/', views.admin_categories, name='admin_categories'),
    path('admin/menu-items/', views.admin_menu_items, name='admin_menu_items'),
    path('admin/blocked-dates/', views.admin_blocked_dates, name='admin_blocked_dates'),
    path('admin/login/', views.admin_login, name='admin_login'),
    path('admin/forgot-password/', views.admin_forgot_password, name='admin_forgot_password'),
    path('admin/reset-password/', views.admin_reset_password, name='admin_reset_password'),
    path('admin/users/', views.admin_users_view, name='admin_users_view'),
    path('admin/users/<int:user_id>/', views.admin_user_detail_view, name='admin_user_detail_view'),
    path('admin/clients/', views.admin_clients_view, name='admin_clients_view'),
    path('admin/communes/', views.admin_communes, name='admin_communes'),
    path('admin/communes/<int:commune_id>/', views.admin_communes, name='admin_communes_detail'),
    path('config/', views.business_config_view, name='business_config_view'),
    path('visits/track/', views.track_visit, name='track_visit'),
    path('admin/visits/', views.admin_visits, name='admin_visits'),
]
