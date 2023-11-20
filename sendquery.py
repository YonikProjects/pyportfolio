from functools import lru_cache
from enviroments import CMS
from sgqlc.endpoint.http import HTTPEndpoint  # type: ignore
from headers import headers


@lru_cache(maxsize=128)
def get_data(query: str):
    URL = CMS + "graphql"  # type: ignore
    endpoint = HTTPEndpoint(URL, base_headers=headers)
    data = endpoint(query)
    return data
