from django.db import models
from django.utils import timezone
import uuid

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    item_id = models.CharField(max_length=50, unique=True, default='')
    name = models.CharField(max_length=150)
    units = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=0)
    description = models.TextField()
    image = models.CharField(max_length=255)
    is_featured = models.BooleanField(default=False)
    badge = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (${self.price:,})"

class Commune(models.Model):
    name = models.CharField(max_length=100, unique=True)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=0, default=4000)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} (+${self.delivery_fee:,})"

class LeadCoupon(models.Model):
    email = models.EmailField()
    coupon_code = models.CharField(max_length=20, unique=True)
    discount_percentage = models.IntegerField(default=5)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} - {self.coupon_code} ({'Usado' if self.is_used else 'Activo'})"

import base64
import hashlib
from cryptography.fernet import Fernet
from django.conf import settings

def get_encryption_key():
    secret_key = getattr(settings, 'SECRET_KEY', 'lina-master-secret-key-2026-banqueteria')
    key = hashlib.sha256(secret_key.encode()).digest()
    return base64.urlsafe_b64encode(key)

def encrypt_value(value):
    if not value or not isinstance(value, str):
        return value
    if value.startswith('enc::'):
        return value
    try:
        f = Fernet(get_encryption_key())
        encrypted = f.encrypt(value.encode()).decode()
        return f"enc::{encrypted}"
    except Exception:
        return value

def decrypt_value(value):
    if not value or not isinstance(value, str):
        return value
    if not value.startswith('enc::'):
        return value
    try:
        token = value[5:]
        f = Fernet(get_encryption_key())
        return f.decrypt(token.encode()).decode()
    except Exception:
        return value

class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente de Validación'),
        ('CONFIRMADO', 'Confirmado y Reservado'),
        ('PREPARANDO', 'En Preparación'),
        ('ENTREGADO', 'Entregado / Completado'),
        ('CANCELADO', 'Cancelado'),
    ]

    SERVICE_CHOICES = [
        ('RETIRO', 'Retiro en Local'),
        ('MONTAJE_SOLO', 'Montaje Decorativo Solo'),
        ('SERVICIO_COMPLETO', 'Servicio Completo con Garzones'),
    ]

    code = models.CharField(max_length=20, unique=True, editable=False)
    client_name = models.CharField(max_length=150)
    client_rut = models.CharField(max_length=255, default='', blank=True, help_text="RUT cifrado en reposo")
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=255, help_text="Teléfono cifrado en reposo")
    commune = models.ForeignKey(Commune, on_delete=models.SET_NULL, null=True, blank=True)
    address = models.CharField(max_length=500, blank=True, null=True, help_text="Dirección cifrada en reposo")
    
    service_type = models.CharField(max_length=30, choices=SERVICE_CHOICES, default='RETIRO')
    event_date = models.DateField()
    time_slot = models.CharField(max_length=50)
    
    total_portions = models.IntegerField(default=0)
    guests_count = models.IntegerField(default=0)
    waiters_count = models.IntegerField(default=0)
    waiters_fee = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    
    items_total = models.DecimalField(max_digits=10, decimal_places=0)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=0, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0)
    final_total = models.DecimalField(max_digits=10, decimal_places=0)
    
    coupon_applied = models.ForeignKey(LeadCoupon, on_delete=models.SET_NULL, null=True, blank=True)
    transfer_voucher = models.TextField(blank=True, null=True, help_text="Base64 or image URL of payment receipt")
    
    # Financial Refund Audit Fields
    is_refunded = models.BooleanField(default=False)
    refund_voucher = models.TextField(blank=True, null=True, help_text="Comprobante de devolución bancaria")
    refund_amount = models.DecimalField(max_digits=10, decimal_places=0, default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDIENTE')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = f"LINA-{uuid.uuid4().hex[:6].upper()}"

        # Automatic Field Encryption at Rest (AES-256)
        if self.client_rut and not self.client_rut.startswith('enc::'):
            self.client_rut = encrypt_value(self.client_rut)
        if self.client_phone and not self.client_phone.startswith('enc::'):
            self.client_phone = encrypt_value(self.client_phone)
        if self.address and not self.address.startswith('enc::'):
            self.address = encrypt_value(self.address)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Pedido {self.code} - {self.client_name} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    item_name = models.CharField(max_length=150)
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=0)
    subtotal = models.DecimalField(max_digits=10, decimal_places=0)

    def __str__(self):
        return f"{self.quantity}x {self.item_name} en {self.order.code}"

class OrderHistory(models.Model):
    """Tabla de Registro Legacy / Audit Log inmutable para cumplimiento legal"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='history')
    previous_status = models.CharField(max_length=30)
    new_status = models.CharField(max_length=30)
    change_reason = models.TextField(blank=True, null=True)
    modified_by = models.CharField(max_length=100, default='Administración')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.order.code}: {self.previous_status} -> {self.new_status} ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"

class BusinessConfig(models.Model):
    key = models.CharField(max_length=50, unique=True)
    value = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.key} = {self.value}"
