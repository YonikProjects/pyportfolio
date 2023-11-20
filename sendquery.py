from functools import lru_cache
from enviroments import CMS, CMSTOKEN
from sgqlc.endpoint.http import HTTPEndpoint  # type: ignore


@lru_cache(maxsize=128)
def get_data(query: str):
    URL = CMS + "graphql"  # type: ignore
    headers = {"Authorization": f"Bearer {CMSTOKEN}"}
    endpoint = HTTPEndpoint(URL, base_headers=headers)
    data = endpoint(query)
    return data
