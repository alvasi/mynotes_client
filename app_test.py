import pytest
import json
import requests_mock
from app import (
    app,
)


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.secret_key = "test_secret_key"
    with app.test_client() as client:
        yield client


def test_index(client):
    """Test the index route."""
    response = client.get("/")
    assert response.status_code == 200


def test_login_page(client):
    """Test the login page route."""
    response = client.get("/login")
    assert response.status_code == 200
    assert b"login" in response.data.lower()


def test_serve_react_app(client):
    """Test serving the React app."""
    response = client.get("/app")
    assert response.status_code == 200
    # Further assertions can be added based on the content of the React app's index.html


def test_register_submit_success(client):
    """Test successful registration submission."""
    with requests_mock.Mocker() as m:
        m.post(
            "http://userapi.fpdsatbedpgcezhj.uksouth.azurecontainer.io:5000/register_submit",
            json={"message": "Registration successful"},
        )
        response = client.post(
            "/registersubmit",
            json={
                "first_name": "Test",
                "last_name": "User",
                "DoB": "2000-01-01",
                "username": "newuser",
                "password": "password",
            },
        )
        data = json.loads(response.data)
        assert response.status_code == 200
        assert data["message"] == "Registration successful"


def test_dashboard_not_logged_in(client):
    """Test dashboard access when not logged in."""
    response = client.get("/api/dashboard")
    assert response.status_code == 401


if __name__ == "__main__":
    pytest.main()
