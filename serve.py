# inspired from http://www.piware.de/2011/01/creating-an-https-server-in-python/
# generate server.xml with the following command:
#    openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
#    https://localhost:4443

import http.server, ssl, os
from subprocess import check_call

IP='0.0.0.0'
PORT='4443'

config_dir = os.getcwd()
if __file__:
    config_dir = os.path.dirname(os.path.realpath(__file__))
config_pem = os.path.join(config_dir, 'server.pem')

web_dir = os.path.join(config_dir, 'web')

def generate_certificate():
    os.chdir(config_dir)
    print(config_dir)
    check_call(["openssl","req", "-new", "-x509", "-keyout", "server.pem", "-out", "server.pem", "-days", "365", "-nodes", "-batch"])

def serve():
    try:
        if not os.path.exists(web_dir):
            os.makedirs(web_dir)
        os.chdir(web_dir)
        print(web_dir)
        server_address = ('0.0.0.0', 4443)
        httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
        httpd.socket = ssl.wrap_socket(httpd.socket,
                                    server_side=True,
                                    certfile=config_pem,
                                    ssl_version=ssl.PROTOCOL_TLSv1_2)
        print('Serving', web_dir, 'at', 'https://' + IP + ':' + PORT)
        httpd.serve_forever()
    except Exception as ex:
        httpd.server_close()
        raise ex

def main():
    try:
        serve()
    except Exception as ex:
        try:
            print(ex)
            print("Failed to serve, generating the certificate.")
            generate_certificate()
            serve()
        except Exception as ex:
            print(ex)
            print("Could not serve even after certificate generation")

if __name__ == "__main__":
    main()