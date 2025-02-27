from supertokens_python.recipe import (
    session,
    emailpassword,
    dashboard,
    usermetadata,
    userroles,
)
from supertokens_python import (
    InputAppInfo,
    SupertokensConfig,
)
import os

# this is the location of the SuperTokens core.
supertokens_config = SupertokensConfig(
    connection_uri=os.environ.get("SUPERTOKENS_DOMAIN", "http://supertokens:3567")
)
app_info = InputAppInfo(
    app_name="Patholearn Authentication",
    api_domain=os.environ.get("API_DOMAIN", "http://api:3001"),
    website_domain=os.environ.get("WEBSITE_DOMAIN", "http://localhost:5174"),
)

framework = "fastapi"

# recipeList contains all the modules that you want to
# use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
recipe_list = [
    emailpassword.init(sign_up_feature=emailpassword.InputSignUpFeature()),
    session.init(
        cookie_domain=os.environ.get("COOKIE_DOMAIN", ".localhost"),
        cookie_secure=True,
        cookie_same_site="lax",
    ),
    dashboard.init(),
    usermetadata.init(),
    userroles.init(),
]
