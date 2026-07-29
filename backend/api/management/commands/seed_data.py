from django.core.management.base import BaseCommand
from api.models import Category, MenuItem, Commune, BusinessConfig

class Command(BaseCommand):
    help = 'Puebla la base de datos con las categorías, productos reales del PDF y comunas de Santiago'

    def handle(self, *args, **options):
        self.stdout.write("Poblando categorías y menú...")
        
        categories_data = [
            {"id_name": "salados", "name": "Boxes Colectivos Salados", "desc": "Selección artesanal de mini panecillos, croissants, tapaditos y bocados salados."},
            {"id_name": "criollos", "name": "Boxes Mix Criollos Gourmet", "desc": "Clásicos parrilleros chilenos en formato bocado: mini hamburguesas, churrasquitos, choripanes y anticuchos."},
            {"id_name": "bebidas", "name": "Coffee Break & Bebidas Premium", "desc": "Estaciones de café filtrado de autor y dispensadores de jugos naturales de estación."},
            {"id_name": "dulces", "name": "Estación Dulce & Repostería Fina", "desc": "Trilogía dulce repostera: shots de tiramisú, mini brownies, alfajores de maicena y churros."}
        ]

        cat_objs = {}
        for c in categories_data:
            obj, _ = Category.objects.get_or_create(slug=c['id_name'], defaults={'name': c['name'], 'description': c['desc']})
            cat_objs[c['id_name']] = obj

        items_data = [
            {"item_id": "box-favoritos", "cat": "salados", "name": "Box Mix Selección Favoritos", "units": 24, "price": 29900, "desc": "6u Panecillos Ave Pimentón, 6u Tapaditos Premium Ave Mayo, 6u Panecillos Jamón y Queso, 6u Bocados Caprese en Miniature.", "img": "/images/box_favoritos.jpg", "featured": True, "badge": "Recomendado de la Casa"},
            {"item_id": "box-autor", "cat": "salados", "name": "Box Mix de Autor & Tendencia", "units": 36, "price": 48500, "desc": "9u Mini Croissants (Jamón/Queso), 9u Wraps Integrales (Vegetales/Ave), 9u Panecillos Palta Fresca, 9u Bocados Caprese.", "img": "/images/empanaditas_pino.jpg", "featured": True, "badge": "Más Vendido"},
            {"item_id": "box-master-salado", "cat": "salados", "name": "Box Master Mix Banquetería Lina", "units": 42, "price": 54900, "desc": "6u Ave Pimentón, 6u Palta Fresca, 6u Jamón/Queso, 6u Tapaditos Ave Mayo, 6u Wraps Integrales, 6u Croissants, 6u Caprese.", "img": "/images/box_favoritos.jpg", "featured": False, "badge": None},
            
            {"item_id": "box-parrillero-familiar", "cat": "criollos", "name": "Box Mix Parrillero Familiar", "units": 16, "price": 32900, "desc": "4u Mini Hamburguesas de Autor, 4u Mini Churrascos Caseros, 4u Mini Choripanes Gourmet, 4u Mini Anticuchos Selección.", "img": "/images/box_parrillero.jpg", "featured": True, "badge": "Favorito Criollo"},
            {"item_id": "box-parrillero-casa", "cat": "criollos", "name": "Box Mix Parrillero de la Casa", "units": 32, "price": 59900, "desc": "8u Mini Hamburguesas de Autor, 8u Mini Churrascos Caseros, 8u Mini Choripanes Gourmet, 8u Mini Anticuchos Selección.", "img": "/images/box_parrillero.jpg", "featured": False, "badge": None},
            {"item_id": "box-master-parrillero", "cat": "criollos", "name": "Box Master Mix Parrillero Premium", "units": 48, "price": 84900, "desc": "12u Mini Hamburguesas de Autor, 12u Mini Churrascos Caseros, 12u Mini Choripanes Gourmet, 12u Mini Anticuchos Selección.", "img": "/images/box_parrillero.jpg", "featured": True, "badge": "Edición Banquete"},
            
            {"item_id": "refresco-cafe-basico", "cat": "bebidas", "name": "Box Mix Estación Refresco & Café (Básico)", "units": 15, "price": 34900, "desc": "Dispensador Jugo (4L, pulpa natural) + Termo Café Autor (2.5L filtrado). Incluye vasos y azúcar (~15 personas).", "img": "/images/estacion_coffee.jpg", "featured": False, "badge": None},
            {"item_id": "coffee-break-full", "cat": "bebidas", "name": "Box Master Estación Coffee Break Lina (Full)", "units": 25, "price": 52900, "desc": "Dispensador Jugo (4L) + Dispensador Térmico Café Grano (4L) + Set Servilletas & Complementos Premium (~25 personas).", "img": "/images/estacion_coffee.jpg", "featured": True, "badge": "Imperdible Eventos"},
            
            {"item_id": "gran-mix-dulce-mediano", "cat": "dulces", "name": "Gran Mix Dulce Mediano", "units": 15, "price": 21500, "desc": "Shots tiramisú, brownies, muffins, churros con salsa y alfajores de maicena. (48h anticipación).", "img": "/images/gran_mix_dulce.jpg", "featured": False, "badge": None},
            {"item_id": "gran-mix-dulce-grande", "cat": "dulces", "name": "Gran Mix Dulce Grande", "units": 35, "price": 46000, "desc": "Recorrido repostero: Shots tiramisú, mini brownies, muffins surtidos, churros y alfajores de maicena.", "img": "/images/gran_mix_dulce.jpg", "featured": True, "badge": "Repostería Fina"}
        ]

        for it in items_data:
            MenuItem.objects.get_or_create(
                item_id=it['item_id'],
                defaults={
                    'category': cat_objs[it['cat']],
                    'name': it['name'],
                    'units': it['units'],
                    'price': it['price'],
                    'description': it['desc'],
                    'image': it['img'],
                    'is_featured': it['featured'],
                    'badge': it['badge']
                }
            )

        communes_data = [
            ("Las Condes", 4500), ("Providencia", 4000), ("Vitacura", 4500), ("Ñuñoa", 3500),
            ("Santiago Centro", 3500), ("La Reina", 4000), ("Lo Barnechea", 5500), ("Macul", 3500),
            ("Peñalolén", 4000), ("Maipú", 4500), ("La Florida", 4000), ("Huechuraba", 4500),
            ("Quilicura", 4500), ("Estación Central", 3500), ("Pudahuel", 4500), ("San Miguel", 3500),
            ("San Joaquín", 3500), ("La Cisterna", 3500), ("Recoleta", 3500), ("Independencia", 3500),
            ("Quinta Normal", 3500), ("Conchalí", 3500), ("Renca", 3500), ("Cerro Navia", 4000),
            ("Lo Prado", 3500), ("Cerrillos", 4000), ("Pedro Aguirre Cerda", 3500), ("San Ramón", 4000),
            ("La Granja", 4000), ("El Bosque", 4000), ("La Pintana", 4500)
        ]

        for c_name, c_fee in communes_data:
            Commune.objects.get_or_create(name=c_name, defaults={'delivery_fee': c_fee})

        # Set default configs
        BusinessConfig.objects.get_or_create(key='min_order_value', defaults={'value': '70000', 'description': 'Mínimo en CLP netos'})
        BusinessConfig.objects.get_or_create(key='waiter_rate', defaults={'value': '20000', 'description': 'Tarifa por garzón por evento'})
        BusinessConfig.objects.get_or_create(key='max_daily_portions', defaults={'value': '250', 'description': 'Máximo de porciones por día'})

        self.stdout.write(self.style.SUCCESS("¡Base de datos poblada exitosamente!"))
