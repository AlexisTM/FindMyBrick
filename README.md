# Find My Brick

Find My LEGO Brick by using your camera!

Click on the brick you want and others of the same color will pop up!

## Running locally

Open web/index.html with your favorite browser.

## Running on a server

The usage of the camera requires a SSL connection. Therefore, you have to generate an SSL certificate.

You can do it by running the generation script followed by the serve command.

```bash
openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
python3 serve.py
```

If you are lazy, you can just run serve.py which will create a key with the `-batch` argument, meaning that the keys are not customized.

```python
python3 serve.py
```
