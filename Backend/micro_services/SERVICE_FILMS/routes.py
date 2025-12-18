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
    get_all_categories, ajouter_categorie, supprimer_categorie
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
# FAVORIS
@films_bp.route("/favoris", methods=["POST"])
def ajouter_favori_route():
    print(f"[DEBUG] POST /favoris reçu")
    data = request.get_json() or {}
    print(f"[DEBUG] Données: {data}")
    
    id_utilisateur = data.get("id_utilisateur")
    id_film = data.get("id_film")
    id_episode = data.get("id_episode")
    
    print(f"[DEBUG] id_utilisateur={id_utilisateur}, id_film={id_film}, id_episode={id_episode}")

    # Validation simple : besoin d'un user et d'un contenu (film XOR épisode)
    if (not id_utilisateur) or (not sum([bool(id_film), bool(id_episode)]) == 1):
        print(f"[DEBUG] Validation échouée")
        return jsonify({"erreur": "Paramètres invalides: fournir id_utilisateur et un seul de (id_film, id_episode)"}), 400

    result = ajouter_favori(id_utilisateur, id_film=id_film, id_episode=id_episode)
    print(f"[DEBUG] Résultat ajouter_favori: {result}")
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)


@films_bp.route("/favoris", methods=["DELETE"])
def supprimer_favori_route():
    print(f"[DEBUG] DELETE /favoris reçu")
    data = request.get_json() or {}
    print(f"[DEBUG] Données: {data}")
    
    id_utilisateur = data.get("id_utilisateur")
    id_film = data.get("id_film")
    id_episode = data.get("id_episode")
    
    print(f"[DEBUG] id_utilisateur={id_utilisateur}, id_film={id_film}, id_episode={id_episode}")

    if (not id_utilisateur) or (not sum([bool(id_film), bool(id_episode)]) == 1):
        print(f"[DEBUG] Validation échouée")
        return jsonify({"erreur": "Paramètres invalides: fournir id_utilisateur et un seul de (id_film, id_episode)"}), 400

    result = supprimer_favori(id_utilisateur, id_film=id_film, id_episode=id_episode)
    print(f"[DEBUG] Résultat supprimer_favori: {result}")
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)


@films_bp.route("/favoris/<int:id_utilisateur>", methods=["GET"])
def lister_favoris_route(id_utilisateur):
    try:
        print(f"[DEBUG] GET /favoris/{id_utilisateur}")
        data = lister_favoris(id_utilisateur)
        print(f"[DEBUG] Résultat lister_favoris: {data}")
        
        if isinstance(data, tuple):
            return jsonify(data[0]), data[1]
        
        # S'assurer que la structure est correcte
        if not isinstance(data, dict):
            data = {"films": [], "episodes": []}
        
        return jsonify(data), 200
    except Exception as e:
        print(f"[ERREUR] GET /favoris/{id_utilisateur}: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"erreur": f"Erreur serveur: {str(e)}", "films": [], "series": [], "episodes": []}), 500

# =======================================
# CATEGORIES
@films_bp.route("/categories", methods=["GET"])
def get_categories():
    """Récupérer toutes les catégories"""
    categories = get_all_categories()
    return jsonify({"succes": True, "data": categories}), 200


@films_bp.route("/categories", methods=["POST"])
def nouvelle_categorie():
    """Ajouter une nouvelle catégorie (admin only)"""
    # Vérifier que l'utilisateur est admin (facultatif, à adapter selon votre auth)
    data = request.get_json()
    if not data or "nom" not in data:
        return jsonify({"erreur": "Le champ 'nom' est obligatoire"}), 400
    
    result, status_code = ajouter_categorie(data["nom"])
    return jsonify(result), status_code


@films_bp.route("/categories/<int:categorie_id>", methods=["DELETE"])
def supprimer_cat(categorie_id):
    """Supprimer une catégorie (admin only)"""
    result, status_code = supprimer_categorie(categorie_id)
    return jsonify(result), status_code