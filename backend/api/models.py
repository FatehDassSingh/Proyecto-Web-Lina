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
    price = models.DecimalField(max_digits=12, decimal_places=0)
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

class BlockedDate(models.Model):
    date = models.DateField(unique=True)
    reason = models.CharField(max_length=255, blank=True, null=True, default='Fecha no disponible por la administración')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return f"Bloqueada: {self.date} ({self.reason})"

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

class Client(models.Model):
    """
    Directorio de Clientes en 3ª Forma Normal (3NF) con datos atomizados.
    Cumple 1NF (datos indivisibles), 2NF (dependencia funcional de la PK) y 3NF (sin dependencias transitivas).
    Relacionado funcionalmente con Commune mediante Foreign Key.
    """
    first_name = models.CharField(max_length=75, default='Cliente', help_text="Primer y segundo nombre del cliente")
    last_name_paternal = models.CharField(max_length=75, default='Registrado', help_text="Apellido paterno del cliente")
    last_name_maternal = models.CharField(max_length=75, blank=True, null=True, default='', help_text="Apellido materno del cliente")
    
    rut_body = models.CharField(max_length=255, blank=True, null=True, default='', help_text="Cuerpo numérico del RUT cifrado en reposo")
    rut_dv = models.CharField(max_length=10, blank=True, null=True, default='', help_text="Dígito verificador del RUT (0-9, K)")
    
    email = models.EmailField(unique=True, help_text="Correo electrónico único del cliente")
    phone = models.CharField(max_length=255, blank=True, null=True, default='', help_text="Teléfono cifrado en reposo")
    
    country = models.CharField(max_length=50, default='Chile')
    region = models.CharField(max_length=100, default='Región Metropolitana de Santiago')
    city = models.CharField(max_length=100, default='Santiago')
    commune = models.ForeignKey(Commune, on_delete=models.SET_NULL, null=True, blank=True, related_name='clients')
    address = models.CharField(max_length=500, blank=True, null=True, default='', help_text="Calle, número, dpto cifrado en reposo")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'

    def save(self, *args, **kwargs):
        # Cifrado automático en reposo (AES-256)
        if self.phone and not self.phone.startswith('enc::'):
            self.phone = encrypt_value(self.phone)
        if self.address and not self.address.startswith('enc::'):
            self.address = encrypt_value(self.address)
        if self.rut_body and not self.rut_body.startswith('enc::'):
            self.rut_body = encrypt_value(self.rut_body)
        super().save(*args, **kwargs)

    @property
    def decrypted_phone(self):
        return decrypt_value(self.phone)

    @property
    def decrypted_address(self):
        return decrypt_value(self.address)

    @property
    def decrypted_rut_body(self):
        return decrypt_value(self.rut_body)

    @property
    def full_name(self):
        maternal = f" {self.last_name_maternal}" if self.last_name_maternal else ""
        return f"{self.first_name} {self.last_name_paternal}{maternal}".strip()

    @property
    def formatted_rut(self):
        dec_body = self.decrypted_rut_body
        if not dec_body:
            return ""
        try:
            body_int = int(dec_body)
            formatted_body = f"{body_int:,}".replace(',', '.')
        except ValueError:
            formatted_body = dec_body
        dv = str(self.rut_dv or '').upper()
        return f"{formatted_body}-{dv}" if dv else formatted_body

    def __str__(self):
        return f"{self.full_name} ({self.email})"

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
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
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

    @property
    def decrypted_address(self):
        return decrypt_value(self.address)

    @property
    def decrypted_phone(self):
        return decrypt_value(self.client_phone)

    @property
    def decrypted_rut(self):
        return decrypt_value(self.client_rut)

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
    value = models.TextField()
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.key} = {self.value}"

class ConfigHistory(models.Model):
    """Registro inmutable de auditoría para cambios en parámetros del negocio"""
    modified_by = models.CharField(max_length=150, default='Administración')
    changes_summary = models.TextField(help_text="Resumen de parámetros modificados")
    previous_config = models.JSONField(default=dict)
    new_config = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Config Audit {self.timestamp.strftime('%Y-%m-%d %H:%M')}: {self.modified_by}"

class AdminUser(models.Model):
    username = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=50, default='Lina')
    last_name_paternal = models.CharField(max_length=50, default='Propietaria')
    last_name_maternal = models.CharField(max_length=50, blank=True, null=True, default='')
    rut_body = models.CharField(max_length=10, default='11111111')
    rut_dv = models.CharField(max_length=1, default='1')
    country = models.CharField(max_length=50, default='Chile')
    region = models.CharField(max_length=100, default='Región Metropolitana de Santiago')
    city = models.CharField(max_length=100, default='Santiago')
    address = models.CharField(max_length=255, blank=True, null=True, default='')
    email = models.EmailField(blank=True, null=True)
    password = models.CharField(max_length=255)
    reset_token = models.CharField(max_length=100, blank=True, null=True)
    reset_token_created_at = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_superadmin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_protected(self):
        return self.is_superadmin or (self.username and self.username.lower() in ['lina', 'admin']) or self.pk == 1 or (self.first_name and self.first_name.lower() == 'lina' and self.last_name_paternal and self.last_name_paternal.lower() == 'propietaria')

    @property
    def full_name(self):
        maternal = f" {self.last_name_maternal}" if self.last_name_maternal else ""
        return f"{self.first_name} {self.last_name_paternal}{maternal}".strip()

    @property
    def formatted_rut(self):
        try:
            body_int = int(self.rut_body)
            formatted_body = f"{body_int:,}".replace(',', '.')
        except ValueError:
            formatted_body = self.rut_body
        return f"{formatted_body}-{str(self.rut_dv).upper()}"

    def __str__(self):
        return f"{self.username} ({self.full_name} - RUT: {self.formatted_rut})"

class SiteVisit(models.Model):
    total_visits = models.BigIntegerField(default=0)
    total_uniques = models.BigIntegerField(default=0)
    last_visit_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Visitas Totales: {self.total_visits} | Únicas: {self.total_uniques}"

class VisitLog(models.Model):
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    path = models.CharField(max_length=100, default='/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
