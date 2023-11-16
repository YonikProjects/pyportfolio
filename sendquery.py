def get_data(query: str):
    import os
    from dotenv import load_dotenv
    from sgqlc.endpoint.http import HTTPEndpoint  # ignore

    load_dotenv()
    URL = os.getenv("CMS")
    URL = URL + "graphql"
    endpoint = HTTPEndpoint(URL)
    data = endpoint(query)
    return data
