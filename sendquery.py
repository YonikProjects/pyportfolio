from enviroments import CMS
from sgqlc.endpoint.http import HTTPEndpoint
from headers import headers


def get_data(query: str):
    URL = CMS + "graphql"
    endpoint = HTTPEndpoint(URL, base_headers=headers)
    data = endpoint(query)
    return data
