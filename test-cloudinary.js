const testCloudinary = async () => {
  const cloudName = 'u7dp9w8d';
  const preset = 'campus_collab_posts';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  
  const formData = new FormData();
  formData.append('upload_preset', preset);
  formData.append('file', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
  
  try {
    const res = await fetch(url, { method: 'POST', body: formData });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
};
testCloudinary();
