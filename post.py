import sendquery
import markdown
import random
from bs4 import BeautifulSoup


class Post:
    def __init__(self, link):
        self.link = link
        all_post_ids = sendquery.get_data(
            """query {
  post {
    id
    link
    background_color
    Text_Color
    title
  }
}"""
        )
        self.all_post_ids = all_post_ids["data"]["post"]
        self.id = self.get_id_from_link()
        post_result = sendquery.get_data(self.get_id_query(self.id))
        post_bracketed = post_result["data"]["post_by_id"]
        self.post = post_bracketed

    def get_id_query(self, id):
        return """query {
      post_by_id(id: %s) {
        id
        title
        subname
        Title_Image { id }
        background_color
        link
        body
        Text_Color
      }
    }""" % (
            id
        )

    def parse_body(self):
        body = markdown.markdown(self.post["body"])
        soup = BeautifulSoup(body, "html.parser")
        images_with_alt = soup.find_all("img", alt=True)
        for img in images_with_alt:
            asset = img["src"].split("/")[-1]
            img["src"] = f"/imgproxy/{asset}/article"
            img["data-zoomable"] = True
            img["loading"] = "lazy"
            alt_div = soup.new_tag("div")
            alt_div["class"] = "alt-text"
            alt_div.string = img["alt"]
            # Insert the new div after the parent of the image (which might be a <p> tag)
            img.insert_after(alt_div)
        a_tags = soup.find_all("a")
        for a in a_tags:
            a["style"] = f"color: {self.post['Text_Color']}; filter: invert(100%);"
        return str(soup)

    def remaining_post_ids(self):
        new_list = self.all_post_ids
        random.shuffle(new_list)
        return new_list

    def get_id_from_link(self):
        matching_dict = next(
            (item for item in self.all_post_ids if item["link"] == self.link), None
        )
        if matching_dict:
            self.all_post_ids.remove(matching_dict)
            id = matching_dict["id"]
            return id
        else:
            new_list = self.all_post_ids
            randomized = random.choice(new_list)
            new_list.remove(randomized)
            self.all_post_ids = new_list
            return randomized["id"]
