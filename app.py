from selenium import webdriver
from functools import lru_cache
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, send_file
import requests
from postpreviews import PostPreviews
from post import Post
from sendgrid import SendGridAPIClient  # type: ignore
from sendgrid.helpers.mail import Mail  # type: ignore

try:
    load_dotenv()
except OSError as e:
    raise SystemExit(f"Error loading .env file: {e}")

required_envs = ["CMS", "TURNSTILE", "SENDGRID", "TOEMAIL", "FROMEMAIL", "DEV"]

for env in required_envs:
    if env not in os.environ:
        raise EnvironmentError(f"Required environment variable {env} not set.")

CMS = os.environ["CMS"]
TURNSTILE = os.environ["TURNSTILE"]
SENDGRID = os.environ["SENDGRID"]
TOEMAIL = os.environ["TOEMAIL"]
FROMEMAIL = os.environ["FROMEMAIL"]
DEV = os.environ["DEV"]


@lru_cache(maxsize=128)  # Limiting cache size to 128 items
def fetch_image(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response
    return None


app = Flask(__name__, static_url_path="")


@app.route("/")
def index():
    previews = PostPreviews()
    return render_template("index.j2", previews=previews.getPreviews())


@app.route("/about")
def about():
    return render_template("about.j2")


@app.route("/projects/")
def projects():
    post = Post("random")
    return render_template("projects.j2", post=post)


@app.route("/projects/<string:link>", methods=["POST"])
def singleproject(link):
    post = Post(link)
    return render_template("components/post.j2", post=post)


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
    post = Post(link)
    return render_template("projects.j2", post=post)


@app.route("/imgproxy/<string:key>/<string:url>")  # type: ignore
def proxy_image(url, key):
    # Replace 'image_url' with the URL of the image you want to proxy
    assets_url = CMS + "assets/"
    if key != "fullsize":
        image_url = assets_url + url + f"?key={key}"
    else:
        image_url = assets_url + url
    # Fetch the image content using the cache

    image_content_with_headers = fetch_image(image_url)
    content_disposition = image_content_with_headers.headers["content-disposition"]  # type: ignore
    image_content = image_content_with_headers.content  # type: ignore

    if image_content:
        # Get the content type of the image
        response = requests.head(image_url)
        content_type = response.headers.get("content-type")
        # Set the appropriate content type for the response
        headers = {
            "Content-Type": content_type,
            "Content-Disposition": content_disposition,
        }
        # Return the image as a response
        return image_content, 200, headers
    else:
        return "Failed to fetch image", 404


@app.route("/screenshot/<int:width>/<int:height>")
def take_screenshot(width, height):
    link = request.args.get("url")
    resolution = (width, height)  # Change this to your desired resolution
    # Configure Chrome options
    edge_options = webdriver.EdgeOptions()
    edge_options.add_experimental_option("detach", True)
    edge_options.set_capability("ms:inPrivate", True)
    edge_options.add_argument("--headless")
    edge_options.add_argument("--hide-scrollbars")
    # To run in headless mode (without opening a window)
    edge_options.add_argument(
        "--no-sandbox"
    )  # Necessary for running in a Docker container

    # Initialize the driver
    driver = webdriver.Edge(options=edge_options)

    # Set window size based on resolution
    driver.set_window_size(*resolution)

    # Open the provided link
    driver.get(link)  # type: ignore
    # Take screenshot
    screenshot_path = "screenshot.png"  # Path to save the screenshot
    driver.save_screenshot(screenshot_path)

    # Close the driver
    driver.quit()

    # Send the screenshot file as a response
    return send_file(screenshot_path, mimetype="image/png")


if __name__ == "__main__":
    if DEV == "True":
        app.run(port=8000, debug=True)
    else:
        from waitress import serve  # type: ignore

        serve(app, port=5000, threads=12)
