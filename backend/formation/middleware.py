class AllowIframeForMedia:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        print("1")
        # Autoriser les frames seulement pour les fichiers media
        if request.path.startswith('/media/'):
            print('2')
            response.headers['X-Frame-Options'] = 'ALLOWALL'
            print(response.headers)

        return response
