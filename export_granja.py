import bpy, os

blend_path = '/Users/salome/Documents/mi-app/granja_virtual.blend'
output_dir = '/Users/salome/Documents/mi-app/public/assets'
os.makedirs(output_dir, exist_ok=True)
out_path = os.path.join(output_dir, 'granja_completa.glb')

bpy.ops.wm.open_mainfile(filepath=blend_path)
# Deselect all
bpy.ops.object.select_all(action='DESELECT')
# Select all objects except cameras and lights
for obj in bpy.data.objects:
    if obj.type not in {'CAMERA', 'LIGHT'}:
        obj.select_set(True)
# Export selected objects as glb (no cameras/lights)
bpy.ops.export_scene.gltf(filepath=out_path, export_selected=True, export_format='GLB')
print('Exportado granja_completa.glb a', out_path)
