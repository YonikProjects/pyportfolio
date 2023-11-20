from enviroments import CMS
from sgqlc.endpoint.http import HTTPEndpoint  # type: ignore
from headers import headers


def get_data(query: str):
    URL = CMS + "graphql"  # type: ignore
    endpoint = HTTPEndpoint(URL, base_headers=headers)
    data = endpoint(query)
    return data
