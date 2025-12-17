from flask import Blueprint, request, jsonify
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from upload_helper import save_uploaded_file
from auth import require_auth_user
from models import (
    get_all_films, get_film_by_id, ajouter_film, modifier_film, supprimer_film,
    get_all_series, get_serie_by_id, ajouter_serie, modifier_serie, supprimer_serie,
    ajouter_saison, get_saisons_serie, supprimer_saison,
    ajouter_episode, get_episodes_saison, modifier_episode, supprimer_episode,
    rechercher_contenus,
    ajouter_favori, supprimer_favori, lister_favoris,
    get_all_categories
)

films_bp = Blueprint("films", __name__)

# #####################################
#  FILMS
@films_bp.route("/films", methods=["GET"])
def liste_films():
    return jsonify({"films": get_all_films()})

@films_bp.route("/films", methods=["POST"])
def nouveau_film():
    # Accepte JSON ou multipart/form-data (upload vidéos)
    if request.content_type and request.content_type.startswith("multipart"):
        form = request.form
        data = {
            "titre": form.get("titre"),
            "description": form.get("description"),
            "id_categorie": form.get("id_categorie"),
            "duree": form.get("duree"),
            "date_sortie": form.get("date_sortie"),
            "pays": form.get("pays"),
            "bande_annonce": None,
            "affiche": None,
            "lien_vo": None,
            "lien_vf": None,
        }

        # Sauvegarde des vidéos
        if "video_vo" in request.files and request.files["video_vo"].filename:
            res_vo = save_uploaded_file(request.files["video_vo"], subfolder="films", file_type="video", prefix="film_vo")
            if res_vo.get("succes"):
                data["lien_vo"] = res_vo.get("chemin_relatif")  # Chemin relatif au lieu d'URL
                print(f"✅ Video VO uploadée: {data['lien_vo']}")
        if "video_vf" in request.files and request.files["video_vf"].filename:
            res_vf = save_uploaded_file(request.files["video_vf"], subfolder="films", file_type="video", prefix="film_vf")
            if res_vf.get("succes"):
                data["lien_vf"] = res_vf.get("chemin_relatif")
                print(f"✅ Video VF uploadée: {data['lien_vf']}")
        
        # Sauvegarde de l'affiche
        if "affiche" in request.files and request.files["affiche"].filename:
            res_affiche = save_uploaded_file(request.files["affiche"], subfolder="images", file_type="image", prefix="affiche_film")
            if res_affiche.get("succes"):
                data["affiche"] = res_affiche.get("chemin_relatif")
                print(f"✅ Affiche uploadée: {data['affiche']}")
        
        # Sauvegarde de la bande-annonce
        if "bande_annonce" in request.files and request.files["bande_annonce"].filename:
            res_ba = save_uploaded_file(request.files["bande_annonce"], subfolder="bande_annonces", file_type="video", prefix="ba_film")
            if res_ba.get("succes"):
                data["bande_annonce"] = res_ba.get("chemin_relatif")
                print(f"✅ Bande-annonce uploadée: {data['bande_annonce']}")
        
        print(f"\n📦 Données finales avant insertion:")
        print(f"   - Titre: {data['titre']}")
        print(f"   - Lien VO: {data['lien_vo']}")
        print(f"   - Lien VF: {data['lien_vf']}")
        print(f"   - Bande-annonce: {data['bande_annonce']}")
        print(f"   - Affiche: {data['affiche']}")
        print()
    else:
        data = request.get_json()

    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400

    result = ajouter_film(data)
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)

@films_bp.route("/films/<int:film_id>", methods=["GET"])
def obtenir_film(film_id):
    film = get_film_by_id(film_id)
    if film is None:
        return jsonify({"erreur": "Film non trouvé"}), 404
    return jsonify(film), 200

@films_bp.route("/films/<int:film_id>", methods=["PUT"])
def modifier_film_route(film_id):
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    return jsonify(modifier_film(film_id, data))

@films_bp.route("/films/<int:film_id>", methods=["DELETE"])
def supprimer_film_route(film_id):
    return jsonify(supprimer_film(film_id))

# #####################################
#  SERIES
@films_bp.route("/series", methods=["GET"])
def liste_series():
    return jsonify({"series": get_all_series()})

@films_bp.route("/series", methods=["POST"])
def nouvelle_serie():
    # Accepte JSON ou multipart/form-data (upload affiche et bande-annonce)
    if request.content_type and request.content_type.startswith("multipart"):
        form = request.form
        data = {
            "titre": form.get("titre"),
            "description": form.get("description"),
            "id_categorie": form.get("id_categorie"),
            "pays": form.get("pays"),
            "date_sortie": form.get("date_sortie", None),
            "affiche": None,
            "bande_annonce": None,
        }

        # Sauvegarde éventuelle des fichiers
        if "affiche" in request.files and request.files["affiche"].filename:
            res_affiche = save_uploaded_file(request.files["affiche"], subfolder="images", file_type="image", prefix="affiche_serie")
            if res_affiche.get("succes"):
                data["affiche"] = res_affiche.get("chemin_relatif")  # Chemin relatif
        if "bande_annonce" in request.files and request.files["bande_annonce"].filename:
            res_ba = save_uploaded_file(request.files["bande_annonce"], subfolder="bande_annonces", file_type="video", prefix="ba_serie")
            if res_ba.get("succes"):
                data["bande_annonce"] = res_ba.get("chemin_relatif")  # Chemin relatif
    else:
        data = request.get_json()
    
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    return jsonify(ajouter_serie(data))

@films_bp.route("/series/<int:serie_id>", methods=["GET"])
def obtenir_serie(serie_id):
    serie = get_serie_by_id(serie_id)
    if serie is None:
        return jsonify({"erreur": "Série non trouvée"}), 404
    return jsonify(serie), 200

@films_bp.route("/series/<int:serie_id>", methods=["PUT"])
def modifier_serie_route(serie_id):
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    return jsonify(modifier_serie(serie_id, data))

@films_bp.route("/series/<int:serie_id>", methods=["DELETE"])
def supprimer_serie_route(serie_id):
    return jsonify(supprimer_serie(serie_id))


# #####################
#  SAISONS
@films_bp.route("/series/<int:serie_id>/saisons", methods=["GET"])
def saisons_serie(serie_id):
    return jsonify({"saisons": get_saisons_serie(serie_id)})

@films_bp.route("/saisons", methods=["POST"])
def nouvelle_saison():
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    return jsonify(ajouter_saison(data))

@films_bp.route("/saisons/<int:saison_id>", methods=["DELETE"])
def supprimer_saison_route(saison_id):
    return jsonify(supprimer_saison(saison_id))

# ###################################
#  EPISODES
@films_bp.route("/saisons/<int:saison_id>/episodes", methods=["GET"])
def episodes_saison(saison_id):
    return jsonify({"episodes": get_episodes_saison(saison_id)})

@films_bp.route("/episodes", methods=["POST"])
def nouvel_episode():
    # Accepte JSON ou multipart/form-data (upload vidéos et bande-annonce)
    if request.content_type and request.content_type.startswith("multipart"):
        form = request.form
        data = {
            "id_saison": form.get("id_saison"),
            "numero_episode": form.get("numero_episode"),
            "titre": form.get("titre"),
            "description": form.get("description"),
            "duree": form.get("duree"),
            "lien_vo": None,
            "lien_vf": None,
            "bande_annonce": None,
        }

        # Sauvegarde éventuelle des vidéos
        if "video_vo" in request.files and request.files["video_vo"].filename:
            res_vo = save_uploaded_file(request.files["video_vo"], subfolder="episodes", file_type="video", prefix="ep_vo")
            if res_vo.get("succes"):
                data["lien_vo"] = res_vo.get("chemin_relatif")  # Chemin relatif
        if "video_vf" in request.files and request.files["video_vf"].filename:
            res_vf = save_uploaded_file(request.files["video_vf"], subfolder="episodes", file_type="video", prefix="ep_vf")
            if res_vf.get("succes"):
                data["lien_vf"] = res_vf.get("chemin_relatif")  # Chemin relatif
        if "bande_annonce" in request.files and request.files["bande_annonce"].filename:
            res_ba = save_uploaded_file(request.files["bande_annonce"], subfolder="bande_annonces", file_type="video", prefix="ba_ep")
            if res_ba.get("succes"):
                data["bande_annonce"] = res_ba.get("chemin_relatif")  # Chemin relatif
    else:
        data = request.get_json()
    
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    return jsonify(ajouter_episode(data))

@films_bp.route("/episodes/<int:episode_id>", methods=["PUT"])
def modifier_episode_route(episode_id):
    data = request.get_json()
    if not data:
        return jsonify({"erreur": "Aucune donnée fournie"}), 400
    return jsonify(modifier_episode(episode_id, data))

@films_bp.route("/episodes/<int:episode_id>", methods=["DELETE"])
def supprimer_episode_route(episode_id):
    return jsonify(supprimer_episode(episode_id))


# Recherche et navigation  Recherche globale (films, séries, épisodes)
@films_bp.route("/recherche", methods=["GET"])
def recherche():
    mot_cle = request.args.get("q", "")
    if not mot_cle:
        return jsonify({"message": "Veuillez entrer un mot-clé pour la recherche."}), 400

    resultats = rechercher_contenus(mot_cle)
    return jsonify(resultats)

# =======================================
# CATEGORIES
@films_bp.route("/categories", methods=["GET"])
def liste_categories():
    """Obtenir toutes les catégories"""
    from config import get_db_connection
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({"erreur": "Connexion base de données indisponible"}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id_categorie, nom FROM categories ORDER BY nom")
        categories = list(cur.fetchall())
        return jsonify({"categories": categories}), 200
    except Exception as e:
        return jsonify({"erreur": f"Erreur: {str(e)}"}), 500
    finally:
        conn.close()


# =======================================
# FAVORIS
@films_bp.route("/favoris", methods=["POST"])
@require_auth_user
def api_ajouter_favori():
    data = request.get_json() or {}
    id_utilisateur = data.get("id_utilisateur")
    id_film = data.get("id_film")
    id_episode = data.get("id_episode")
    res = ajouter_favori(id_utilisateur, id_film, id_episode)
    if isinstance(res, tuple):
        return jsonify(res[0]), res[1]
    return jsonify(res)


@films_bp.route("/favoris", methods=["DELETE"])
@require_auth_user
def api_supprimer_favori():
    data = request.get_json() or {}
    id_utilisateur = data.get("id_utilisateur")
    id_film = data.get("id_film")
    id_episode = data.get("id_episode")
    res = supprimer_favori(id_utilisateur, id_film, id_episode)
    if isinstance(res, tuple):
        return jsonify(res[0]), res[1]
    return jsonify(res)


@films_bp.route("/favoris/<int:id_utilisateur>", methods=["GET"])
def api_lister_favoris(id_utilisateur):
    res = lister_favoris(id_utilisateur)
    return jsonify(res), 200


@films_bp.route("/films/vedette", methods=["GET"])
def get_film_vedette():
    """Retourne un film aléatoire ou tendance en vedette"""
    try:
        import random
        all_films = get_all_films()
        if not all_films:
            return jsonify({"succes": False, "erreur": "Aucun film disponible"}), 404
        
        film_vedette = random.choice(all_films)
        return jsonify({"succes": True, "data": film_vedette}), 200
    except Exception as e:
        return jsonify({"succes": False, "erreur": str(e)}), 500


# #####################################
#  CATEGORIES
@films_bp.route("/categories", methods=["GET"])
def get_categories():
    """Récupérer toutes les catégories"""
    categories = get_all_categories()
    return jsonify({"succes": True, "data": categories}), 200