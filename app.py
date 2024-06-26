import random
import sendquery
from PIL import Image
from io import BytesIO
from enviroments import (
    CMS,
    TURNSTILE,
    FROMEMAIL,
    TOEMAIL,
    SENDGRID,
    PRERENDER,
    CAPTAIN,
    DEV,
)
from functools import lru_cache
from flask import Flask, jsonify, redirect, render_template, request, url_for
import requests
from postpreviews import PostPreviews
from post import Post
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import headers


@lru_cache(maxsize=128)  # Limiting cache size to 128 items
def fetch_image(url, auth=False):
    try:
        if auth is True:
            response = requests.get(url, headers=headers.headers)
        else:
            response = requests.get(url)
        if response.status_code == 200:
            return response
        else:
            print(response.status_code)
            return None
    except Exception as e:
        print(e)
        return None


app = Flask(__name__, static_url_path="")


@app.route("/")
def index():
    previews = PostPreviews()
    info = sendquery.get_data(
        """query {
      static_profile 
      {
        index_long_text
        index_short_text
        Profile_Pic {id}
      }
    }"""
    )
    return render_template(
        "index.j2", previews=previews.getPreviews(), info=info["data"]["static_profile"]
    )


@app.route("/about")
def about():
    info = sendquery.get_data(
        """query {
      static_profile 
      {
        About_text
        Profile_Pic {id}
      }
    }"""
    )
    return render_template(
        "about.j2",
        info=info["data"]["static_profile"],
        previews=PostPreviews().getPreviews(),
    )


@app.route("/projects/")
def projects():
    post = random.choice(PostPreviews().getPreviews())
    return redirect(url_for("singleproject", link=post["link"]), 303)


@app.route("/projects/<string:link>", methods=["POST"])
def singleproject(link):
    return render_template("components/post.j2", post=Post(link))


@app.route("/pform", methods=["POST"])
def form():
    try:
        data = request.get_json()
        cf_request = requests.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            json={"secret": TURNSTILE, "response": data["cf-turnstile-response"]},
        )
        cf_result = cf_request.json()
        if cf_result["success"] is False:
            raise Exception(f"Cloudflare said: {cf_result}")
        else:
            message = Mail(
                from_email=FROMEMAIL,
                to_emails=TOEMAIL,
                subject="New Form submission!",
                html_content=f"Name: {data['name']}, Email: {data['email']}, Phone: {data['phone']}, Subject: {data['subject']}, Message: {data['message']}",
            )
            sg = SendGridAPIClient(SENDGRID)
            sg.send(message)
            return jsonify({"success": True})
    except Exception as e:
        print(e)
        return jsonify({"error": True})


@app.route("/projects/nextpost/", methods=["POST"])
def nextpost():
    data = request.get_json()
    return render_template("components/nextpost.j2", post=data)


@app.route("/projects/<string:link>")
def pickproject(link):
    info = sendquery.get_data(
        """query {
      static_profile 
      {
        index_short_text
      }
    }"""
    )
    return render_template(
        "projects.j2", post=Post(link), info=info["data"]["static_profile"]
    )


@app.route("/imgproxy/<string:key>/<string:url>")
def proxy_image(url, key):
    # Replace 'image_url' with the URL of the image you want to proxy
    assets_url = CMS + "assets/"
    if key != "fullsize":
        image_url = assets_url + url + f"?key={key}"
    else:
        image_url = assets_url + url
    # Fetch the image content using the cache
    image_content_with_headers = fetch_image(url=image_url, auth=True)

    if image_content_with_headers:
        content_disposition = image_content_with_headers.headers["content-disposition"]
        image_content = image_content_with_headers.content
        # Get the content type of the image
        image = Image.open(BytesIO(image_content))
        webp_buffer = BytesIO()
        image.save(webp_buffer, "WEBP")
        webp_buffer.seek(0)
        # Set the appropriate content type for the response
        headers = {
            "Content-Type": "image/webp",
            "Content-Disposition": content_disposition,
        }
        # Return the image as a response
        return image_content, 200, headers
    else:
        return "Failed to fetch image", 404


@app.route("/screenshot/<int:width>/<int:height>")
def take_screenshot(width, height):
    link = request.args.get("url")
    if link == "/" or link is None:
        link = ""
    url = f"{PRERENDER}render?height={height}&width={width}&renderType=png&url={CAPTAIN}{link}"
    # print(url)

    # Fetch the image content using the cache

    image_content_with_headers = fetch_image(url)

    if image_content_with_headers:
        # Get the content type of the image
        image_content = image_content_with_headers.content
        response = image_content_with_headers.headers
        content_type = response["content-type"]
        # Set the appropriate content type for the response
        headers = {
            "Content-Type": content_type,
        }
        # Return the image as a response
        return image_content, 200, headers
    else:
        return "Failed to fetch image", 404


if __name__ == "__main__":
    if DEV == "True":
        app.run(port=8000, debug=True)
    else:
        from waitress import serve

        serve(app, port=5000, threads=12)
