backup
mongodump --uri="mongodb+srv://sihleshabangu5138:test123@cluster0.nk9ud.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" --out=./backup-$(date +%Y-%m-%d)


restore
