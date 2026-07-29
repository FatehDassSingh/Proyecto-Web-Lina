from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from datetime import datetime, timedelta
import random
import string
import os

from .models import Category, MenuItem, Commune, LeadCoupon, Order, OrderItem, OrderHistory, BusinessConfig
from .serializers import (
    CategorySerializer, CategoryDetailSerializer, MenuItemSerializer, CommuneSerializer, 
    LeadCouponSerializer, OrderSerializer, OrderHistorySerializer, BusinessConfigSerializer
)

# Resend API email helper
def send_resend_welcome_email(to_email, coupon_code):
    resend_api_key = os.environ.get('RESEND_API_KEY', '')
    if not resend_api_key:
        print(f"[RESEND SIMULATION] Email sent to {to_email} with coupon code: {coupon_code}")
        return True
    try:
        import resend
        resend.api_key = resend_api_key
        resend.Emails.send({
            "from": "Banquetería Lina <contacto@banqueterialina.cl>",
            "to": [to_email],
            "subject": "Tu 5% de descuento en Banquetería Lina",
            "html": f"""
                <div style="font-family: Georgia, serif; background-color: #1A120C; color: #FAF6F0; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #E5C384; text-align: center;">¡Bienvenido a Banquetería Lina!</h2>
                    <p style="font-size: 16px; line-height: 1.6; font-style: italic; color: #DFB76C; text-align: center; border-left: 3px solid #D9822B; padding-left: 15px;">
                        "Queremos liberar a los anfitriones del estrés y permitirles ser invitados en su propia fiesta. Creemos en el arte de cuidar cada detalle invisible para que tú solo tengas que preocuparte de lo más importante: estar presente, conectar con los tuyos y disfrutar de la compañía."
                    </p>
                    <div style="background-color: #2A1D13; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
                        <span style="font-size: 14px; color: #FAF6F0; display: block; margin-bottom: 8px;">Tu código de 5% de descuento es:</span>
                        <strong style="font-size: 28px; letter-spacing: 4px; color: #E5C384; font-family: monospace;">{coupon_code}</strong>
                    </div>
                    <p style="text-align: center; font-size: 14px; color: #A09080;">Ingresa este código durante la solicitud de tu servicio en nuestro sitio web.</p>
                </div>
            """
        })
        return True
    except Exception as e:
        print(f"[RESEND ERROR] {e}")
        return False

@api_view(['GET'])
def get_menu(request):
    categories = Category.objects.all()
    serializer = CategoryDetailSerializer(categories, many=True)
    items = MenuItem.objects.filter(is_active=True)
    items_serializer = MenuItemSerializer(items, many=True)
    return Response({
        'categories': serializer.data,
        'items': items_serializer.data
    })

@api_view(['GET'])
def get_communes(request):
    communes = Commune.objects.filter(is_active=True).order_by('name')
    serializer = CommuneSerializer(communes, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def capture_lead_coupon(request):
    email = request.data.get('email', '').strip().lower()
    if not email or '@' not in email:
        return Response({'error': 'Por favor ingresa un correo electrónico válido.'}, status=status.HTTP_400_BAD_REQUEST)
    
    existing = LeadCoupon.objects.filter(email=email).first()
    if existing:
        return Response({
            'message': 'Ya tenías un cupón generado previamente.',
            'coupon_code': existing.coupon_code,
            'discount_percentage': existing.discount_percentage
        })

    short_hash = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    coupon_code = f"LINA5-{short_hash}"
    
    coupon = LeadCoupon.objects.create(
        email=email,
        coupon_code=coupon_code,
        discount_percentage=5
    )

    send_resend_welcome_email(email, coupon_code)

    return Response({
        'message': '¡Cupón generado con éxito y correo de bienvenida enviado!',
        'coupon_code': coupon_code,
        'discount_percentage': 5
    })

@api_view(['POST'])
def validate_coupon(request):
    code = request.data.get('code', '').strip().upper()
    if not code:
        return Response({'error': 'Código de cupón requerido.'}, status=status.HTTP_400_BAD_REQUEST)
    
    coupon = LeadCoupon.objects.filter(coupon_code=code, is_used=False).first()
    if not coupon:
        return Response({'error': 'El cupón no es válido o ya fue utilizado.'}, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'valid': True,
        'coupon_code': coupon.coupon_code,
        'discount_percentage': coupon.discount_percentage
    })

@api_view(['GET'])
def check_availability(request):
    date_str = request.query_params.get('date', '')
    service_type = request.query_params.get('service_type', 'RETIRO')

    if not date_str:
        return Response({'error': 'Parámetro date requerido.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        req_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Formato de fecha inválido. Usar YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

    today = timezone.now().date()
    lead_days = (req_date - today).days

    if lead_days < 3:
        return Response({
            'available': False,
            'reason': 'Se exige un mínimo de 3 días de anticipación para realizar reservas.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if service_type in ['MONTAJE_SOLO', 'SERVICIO_COMPLETO']:
        if req_date.weekday() != 5: # Saturday = 5
            return Response({
                'available': False,
                'reason': 'Los servicios de montaje y banquetería en terreno solo pueden realizarse los días Sábado.'
            }, status=status.HTTP_400_BAD_REQUEST)

    return Response({'available': True})

def validate_chilean_rut(rut_str):
    if not rut_str:
        return False
    clean_rut = rut_str.replace('.', '').replace('-', '').replace(' ', '').upper().strip()
    if len(clean_rut) < 8 or len(clean_rut) > 9:
        return False
    
    body = clean_rut[:-1]
    dv = clean_rut[-1]
    
    if not body.isdigit():
        return False
        
    reversed_digits = [int(d) for d in reversed(body)]
    multipliers = [2, 3, 4, 5, 6, 7]
    total = sum(d * multipliers[i % 6] for i, d in enumerate(reversed_digits))
    
    remainder = total % 11
    expected = 11 - remainder
    
    if expected == 11:
        expected_dv = '0'
    elif expected == 10:
        expected_dv = 'K'
    else:
        expected_dv = str(expected)
        
    return dv == expected_dv

def get_config_value(key, default_val):
    try:
        cfg = BusinessConfig.objects.filter(key=key).first()
        if cfg and cfg.value.isdigit():
            return int(cfg.value)
    except Exception:
        pass
    return default_val

@api_view(['GET', 'POST', 'PUT'])
def business_config_view(request):
    defaults = {
        'waiter_fee': ('20000', 'Tarifa por Garzón (bloque de 4 hrs)'),
        'min_order_total': ('70000', 'Mínimo Económico de Compra en Productos'),
        'max_daily_portions': ('250', 'Límite Máximo de Porciones Diarias')
    }
    for k, (val, desc) in defaults.items():
        BusinessConfig.objects.get_or_create(key=k, defaults={'value': val, 'description': desc})

    if request.method in ['POST', 'PUT']:
        data = request.data
        if isinstance(data, dict):
            for k, val in data.items():
                BusinessConfig.objects.filter(key=k).update(value=str(val))

    configs = BusinessConfig.objects.all()
    res_dict = {cfg.key: int(cfg.value) if cfg.value.isdigit() else cfg.value for cfg in configs}
    return Response(res_dict)

@api_view(['POST'])
def create_order(request):
    data = request.data
    items_data = data.get('items', [])
    
    if not items_data:
        return Response({'error': 'El carrito no contiene productos.'}, status=status.HTTP_400_BAD_REQUEST)

    # Dynamic Operational Rules from BusinessConfig
    min_order_total = get_config_value('min_order_total', 70000)
    max_daily_portions = get_config_value('max_daily_portions', 250)
    waiter_fee_unit = get_config_value('waiter_fee', 20000)

    # Calculate total portions in cart
    total_portions = sum(int(item.get('units', 1)) * int(item.get('quantity', 1)) for item in items_data)

    if total_portions > max_daily_portions:
        return Response({
            'error': f'Tu pedido suma {total_portions:,} porciones en total, excediendo el límite máximo operativo de {max_daily_portions:,} porciones por pedido/día. Por favor contáctanos directamente para coordinar un banquete masivo.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Chilean RUT validation
    client_rut = data.get('client_rut', '').strip()
    if client_rut and not validate_chilean_rut(client_rut):
        return Response({'error': 'El RUT ingresado no es válido en Chile (Algoritmo Módulo 11).'}, status=status.HTTP_400_BAD_REQUEST)

    items_total = sum(int(item.get('price', 0)) * int(item.get('quantity', 1)) for item in items_data)
    
    if items_total < min_order_total:
        return Response({
            'error': f'El mínimo económico de compra es ${min_order_total:,} CLP netos en productos. Total actual: ${items_total:,}'
        }, status=status.HTTP_400_BAD_REQUEST)

    coupon_obj = None
    discount_amount = 0
    coupon_code = data.get('coupon_code', '')
    if coupon_code:
        coupon_obj = LeadCoupon.objects.filter(coupon_code=coupon_code.upper(), is_used=False).first()
        if coupon_obj:
            discount_amount = int(items_total * 0.05)

    raw_delivery_fee = data.get('delivery_fee')
    delivery_fee = int(raw_delivery_fee) if raw_delivery_fee is not None and str(raw_delivery_fee).isdigit() else 0

    raw_waiters_count = data.get('waiters_count')
    waiters_count = int(raw_waiters_count) if raw_waiters_count is not None and str(raw_waiters_count).isdigit() else 0
    waiters_fee = waiters_count * waiter_fee_unit
    
    final_total = (items_total + delivery_fee + waiters_fee) - discount_amount

    raw_guests_count = data.get('guests_count')
    guests_count = int(raw_guests_count) if raw_guests_count is not None and str(raw_guests_count).isdigit() else 0

    order = Order.objects.create(
        client_name=data.get('client_name'),
        client_rut=client_rut,
        client_email=data.get('client_email'),
        client_phone=data.get('client_phone'),
        address=data.get('address', ''),
        service_type=data.get('service_type', 'RETIRO'),
        event_date=data.get('event_date'),
        time_slot=data.get('time_slot', '12:00 - 14:00'),
        total_portions=total_portions,
        guests_count=guests_count,
        waiters_count=waiters_count,
        waiters_fee=waiters_fee,
        items_total=items_total,
        delivery_fee=delivery_fee,
        discount_amount=discount_amount,
        final_total=final_total,
        coupon_applied=coupon_obj,
        transfer_voucher=data.get('transfer_voucher') or data.get('voucher') or '',
        status='PENDIENTE'
    )

    if coupon_obj:
        coupon_obj.is_used = True
        coupon_obj.save()

    for item in items_data:
        OrderItem.objects.create(
            order=order,
            item_name=item.get('name'),
            quantity=item.get('quantity', 1),
            unit_price=item.get('price'),
            subtotal=int(item.get('price')) * int(item.get('quantity', 1))
        )

    OrderHistory.objects.create(
        order=order,
        previous_status='CREADO',
        new_status='PENDIENTE',
        change_reason='Pedido ingresado por el cliente en la plataforma web'
    )

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def upload_transfer_voucher(request, order_id):
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response({'error': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
    
    voucher = request.data.get('voucher')
    if not voucher:
        return Response({'error': 'Comprobante requerido.'}, status=status.HTTP_400_BAD_REQUEST)

    order.transfer_voucher = voucher
    order.save()

    OrderHistory.objects.create(
        order=order,
        previous_status=order.status,
        new_status=order.status,
        change_reason='Cliente adjuntó comprobante de transferencia bancaria'
    )

    return Response({'message': 'Comprobante cargado correctamente. El pedido está en revisión.'})

# --- ADMIN VIEWS ---

@api_view(['GET', 'PATCH'])
def admin_orders(request):
    if request.method == 'GET':
        orders = Order.objects.filter(is_active=True).order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        order_id = request.data.get('order_id')
        new_status = request.data.get('status')
        reason = request.data.get('reason', 'Actualización manual desde Panel Admin')
        rectified_total = request.data.get('rectified_total')
        is_refunded = request.data.get('is_refunded')
        refund_voucher = request.data.get('refund_voucher')
        refund_amount = request.data.get('refund_amount')

        order = Order.objects.filter(id=order_id).first()
        if not order:
            return Response({'error': 'Pedido no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        # Strict validation: if marking refund as true, refund_voucher MUST be provided or already present
        if is_refunded is not None:
            will_be_refunded = bool(is_refunded)
            if will_be_refunded and not refund_voucher and not order.refund_voucher:
                return Response({
                    'error': 'Para marcar una devolución como realizada, es OBLIGATORIO adjuntar la foto o comprobante bancario de devolución.'
                }, status=status.HTTP_400_BAD_REQUEST)

            order.is_refunded = will_be_refunded
            if refund_voucher:
                order.refund_voucher = refund_voucher
            if refund_amount is not None:
                order.refund_amount = int(refund_amount)

        prev_status = order.status
        if new_status and new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
        
        if rectified_total is not None:
            order.final_total = int(rectified_total)

        order.save()

        OrderHistory.objects.create(
            order=order,
            previous_status=prev_status,
            new_status=order.status,
            change_reason=reason,
            modified_by='Propietaria (Admin)'
        )

        return Response(OrderSerializer(order).data)

@api_view(['GET'])
def admin_leads(request):
    leads = LeadCoupon.objects.all().order_by('-created_at')
    serializer = LeadCouponSerializer(leads, many=True)
    return Response(serializer.data)

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def admin_categories(request):
    if request.method == 'GET':
        categories = Category.objects.all().order_by('id')
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        name = request.data.get('name', '').strip()
        slug = request.data.get('slug', '').strip() or name.lower().replace(' ', '-').replace('ñ', 'n')
        description = request.data.get('description', '').strip()

        if not name:
            return Response({'error': 'El nombre de la línea/categoría es obligatorio.'}, status=status.HTTP_400_BAD_REQUEST)

        category = Category.objects.create(name=name, slug=slug, description=description)
        return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)

    elif request.method == 'PUT':
        category_id = request.data.get('id')
        category = Category.objects.filter(id=category_id).first()
        if not category:
            return Response({'error': 'Categoría no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data:
            category.name = request.data['name']
        if 'slug' in request.data:
            category.slug = request.data['slug']
        if 'description' in request.data:
            category.description = request.data['description']

        category.save()
        return Response(CategorySerializer(category).data)

    elif request.method == 'DELETE':
        category_id = request.data.get('id') or request.query_params.get('id')
        category = Category.objects.filter(id=category_id).first()
        if not category:
            return Response({'error': 'Categoría no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        category.delete()
        return Response({'message': 'Línea/Categoría eliminada correctamente.'})

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def admin_menu_items(request):
    if request.method == 'GET':
        items = MenuItem.objects.all().order_by('-id')
        serializer = MenuItemSerializer(items, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        category_id = request.data.get('category_id')
        category = Category.objects.filter(id=category_id).first()
        if not category:
            return Response({'error': 'Categoría no encontrada.'}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name', '').strip()
        price = request.data.get('price')
        units = request.data.get('units', 1)
        description = request.data.get('description', '').strip()
        image = request.data.get('image', '/images/box_favoritos.jpg')
        is_featured = bool(request.data.get('is_featured', False))
        badge = request.data.get('badge', '')

        if not name or price is None:
            return Response({'error': 'Nombre y precio son obligatorios.'}, status=status.HTTP_400_BAD_REQUEST)

        item_id = f"item-{uuid.uuid4().hex[:6]}"

        item = MenuItem.objects.create(
            category=category,
            item_id=item_id,
            name=name,
            price=int(price),
            units=int(units),
            description=description,
            image=image,
            is_featured=is_featured,
            badge=badge,
            is_active=True
        )
        return Response(MenuItemSerializer(item).data, status=status.HTTP_201_CREATED)

    elif request.method == 'PUT':
        item_id = request.data.get('id')
        item = MenuItem.objects.filter(id=item_id).first()
        if not item:
            return Response({'error': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        if 'category_id' in request.data:
            cat = Category.objects.filter(id=request.data['category_id']).first()
            if cat:
                item.category = cat
        if 'name' in request.data:
            item.name = request.data['name']
        if 'price' in request.data:
            item.price = int(request.data['price'])
        if 'units' in request.data:
            item.units = int(request.data['units'])
        if 'description' in request.data:
            item.description = request.data['description']
        if 'image' in request.data:
            item.image = request.data['image']
        if 'is_featured' in request.data:
            item.is_featured = bool(request.data['is_featured'])
        if 'is_active' in request.data:
            item.is_active = bool(request.data['is_active'])

        item.save()
        return Response(MenuItemSerializer(item).data)

    elif request.method == 'DELETE':
        item_id = request.data.get('id') or request.query_params.get('id')
        item = MenuItem.objects.filter(id=item_id).first()
        if not item:
            return Response({'error': 'Producto no encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        item.delete()
        return Response({'message': 'Producto eliminado correctamente.'})
