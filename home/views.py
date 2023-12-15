from django.shortcuts import render


# Create your views here.
def meet(request, public_id):
    return render(request, "home/meet.html")
