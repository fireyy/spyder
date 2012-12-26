#coding: utf-8
import os, sys
parentdir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parentdir not in sys.path:
    sys.path.insert(0,parentdir)

from flask import Module, url_for, g, session, current_app, request, redirect

#from spyder.spyder import Spyder
from spyder.seed import Seed
from spyder.document import Grab
from web.models import Seed as Seed_Model

test_seed = Module(__name__)

@test_seed.route("/list/<int:seed_id>")
def list(seed_id):
    if seed_id:
        db = Seed_Model();
        r = db.view(seed_id);
        seed = Seed(r.list()[0])
        t = os.popen(Grab(seed, False))
        
    return t.read()