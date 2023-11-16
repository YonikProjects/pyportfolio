import sendquery

query = """query {
  post {
    title
    subname
    Title_Image { id }
    background_color
    link
  }
}"""


class PostPreviews:
    def __init__(self):
        self.post_previews = sendquery.get_data(query)

    def getCount(self):
        return len(self.post_previews)

    def getPreviews(self):
        data = self.post_previews
        return list(reversed(data["data"]["post"]))
