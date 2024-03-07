import json
import unittest
from app import app
from flask import session


class TestApp(unittest.TestCase):
    def setUp(self):
        app.testing = True
        app.secret_key = "myrandomkey"
        self.app = app.test_client()

    def test_login(self):
        response = self.app.get("/login")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Login", response.data)

    def test_login(self):
        response = self.app.get("/login")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Login", response.data)

    def test_dashboard_without_username(self):
        response = self.app.get("/api/dashboard")
        self.assertEqual(response.status_code, 401)
        self.assertIn(b"false", response.data)

    def test_dashboard_with_username(self):
        with self.app.session_transaction() as session:
            session["username"] = "test_username"
            session["name"] = "test_name"
        response = self.app.get("/api/dashboard")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"true", response.data)


if __name__ == "__main__":
    unittest.main()
