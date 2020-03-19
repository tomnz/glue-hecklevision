import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    DEBUG = True
    TESTING = False
    SECRET_KEY = 'Lol this isn\'t actually a secret, this app is reallllly low stakes'
