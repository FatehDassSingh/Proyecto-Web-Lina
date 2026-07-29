from django.urls import path
from . import views

urlpatterns = [
    path('menu/', views.get_menu, name='get_menu'),
    path('communes/', views.get_communes, name='get_communes'),
    path('coupons/lead/', views.capture_lead_coupon, name='capture_lead_coupon'),
    path('coupons/validate/', views.validate_coupon, name='validate_coupon'),
    path('orders/check_availability/', views.check_availability, name='check_availability'),
    path('orders/', views.create_order, name='create_order'),
    path('orders/<int:order_id>/upload_voucher/', views.upload_transfer_voucher, name='upload_transfer_voucher'),
    path('admin/orders/', views.admin_orders, name='admin_orders'),
    path('admin/leads/', views.admin_leads, name='admin_leads'),
    path('admin/categories/', views.admin_categories, name='admin_categories'),
    path('admin/menu-items/', views.admin_menu_items, name='admin_menu_items'),
    path('config/', views.business_config_view, name='business_config_view'),
]
