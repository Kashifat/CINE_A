from flask import Flask, jsonify
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app)

# Charger la config des pays
def load_countries_config():
    """Charger la liste des pays autorisés"""
    config_path = os.path.join(os.path.dirname(__file__), 'countries_config.json')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Erreur chargement config pays: {str(e)}")
        return {"enabled_countries": [], "country_names": {}}

# Parser le fichier M3U
def parse_m3u(file_path, enabled_countries):
    """Parse un fichier M3U et filtre par pays"""
    channels = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Chercher une ligne EXTINF (métadonnées de chaîne)
            if line.startswith('#EXTINF:'):
                # Extraire les infos
                extinf = line
                name = extinf.split(',')[-1] if ',' in extinf else 'Unknown'
                
                # Extraire le logo
                logo = ''
                if 'tvg-logo="' in extinf:
                    logo = extinf.split('tvg-logo="')[1].split('"')[0]
                
                # Extraire la catégorie
                group = ''
                if 'group-title="' in extinf:
                    group = extinf.split('group-title="')[1].split('"')[0]
                
                # Extraire le pays du tvg-id (exemple: "tvg-id="123tv.de@SD"" -> "de")
                country_code = ''
                if 'tvg-id="' in extinf:
                    tvg_id = extinf.split('tvg-id="')[1].split('"')[0]
                    # Format: "name.country@SD" ou "name.country"
                    if '.' in tvg_id:
                        parts = tvg_id.split('.')
                        country_part = parts[-1] if len(parts) > 1 else ''
                        country_code = country_part.split('@')[0].lower()
                
                # Vérifier si le pays est dans la liste autorisée
                if country_code.lower() in [c.lower() for c in enabled_countries]:
                    # Prochaine ligne = URL
                    i += 1
                    if i < len(lines):
                        url = lines[i].strip()
                        if url and not url.startswith('#'):
                            channels.append({
                                'name': name,
                                'url': url,
                                'logo': logo,
                                'category': group,
                                'country': country_code.upper(),
                                'id': len(channels) + 1
                            })
            
            i += 1
        
        return channels
    except Exception as e:
        print(f"❌ Erreur parsing M3U: {str(e)}")
        return []

# Charger la config au démarrage
COUNTRIES_CONFIG = load_countries_config()
ENABLED_COUNTRIES = COUNTRIES_CONFIG.get('enabled_countries', [])

# Charger les chaînes au démarrage
m3u_path = os.path.join(os.path.dirname(__file__), '..', '..', 'Serveur_Local', 'iptv.m3u')
CHANNELS = parse_m3u(m3u_path, ENABLED_COUNTRIES)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'SERVICE_TV'})

@app.route('/tv/countries', methods=['GET'])
def get_countries():
    """Retourner les pays disponibles"""
    countries = []
    country_names = COUNTRIES_CONFIG.get('country_names', {})
    for country_code in ENABLED_COUNTRIES:
        countries.append({
            'code': country_code.upper(),
            'name': country_names.get(country_code, country_code.upper())
        })
    return jsonify(sorted(countries, key=lambda x: x['name'])), 200

@app.route('/tv/channels', methods=['GET'])
def get_channels():
    """Retourner toutes les chaînes"""
    return jsonify(CHANNELS), 200

@app.route('/tv/channels/<category>', methods=['GET'])
def get_channels_by_category(category):
    """Retourner les chaînes par catégorie"""
    filtered = [ch for ch in CHANNELS if ch['category'].lower() == category.lower()]
    return jsonify(filtered), 200

@app.route('/tv/channels/country/<country_code>', methods=['GET'])
def get_channels_by_country(country_code):
    """Retourner les chaînes par pays"""
    filtered = [ch for ch in CHANNELS if ch['country'].upper() == country_code.upper()]
    return jsonify(filtered), 200

@app.route('/tv/categories', methods=['GET'])
def get_categories():
    """Retourner toutes les catégories uniques"""
    categories = list(set(ch['category'] for ch in CHANNELS if ch['category']))
    return jsonify(sorted(categories)), 200

@app.route('/tv/search/<keyword>', methods=['GET'])
def search_channels(keyword):
    """Chercher des chaînes par nom"""
    keyword_lower = keyword.lower()
    filtered = [ch for ch in CHANNELS if keyword_lower in ch['name'].lower()]
    return jsonify(filtered), 200

if __name__ == '__main__':
    print(f"📺 {len(CHANNELS)} chaînes TV chargées!")
    print(f"📂 Fichier: {m3u_path}")
    app.run(host='0.0.0.0', port=5011, debug=True)
