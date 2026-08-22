import os

path = 'c:/Users/RANADEEP/OneDrive/Desktop/CC/src/components/events/EventCard.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const dateObj = new Date(event.dateTime);", "const dateObj = new Date(event.dateTime);\n  const coverUrl = event.coverImageUrl ? (event.coverImageUrl.includes('res.cloudinary.com') ? event.coverImageUrl.replace('/upload/', '/upload/c_limit,w_800,f_auto,q_auto/') : event.coverImageUrl) : null;")

# In the modal
content = content.replace("src={event.coverImageUrl}", "src={coverUrl}")
content = content.replace("{event.coverImageUrl ? (", "{coverUrl ? (")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated EventCard.js')
