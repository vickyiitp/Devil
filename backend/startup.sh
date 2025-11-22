#!/bin/bash
python -m gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app