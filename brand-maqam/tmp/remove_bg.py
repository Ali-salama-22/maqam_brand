import sys
from PIL import Image

def remove_background(input_path, output_path):
    print(f"Processing {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    width, height = img.size
    pixels = img.load()
    
    bg_color = pixels[0, 0]
    
    # We define background as any color very close to the top-left color
    def is_bg(c):
        r, g, b, a = c
        dist = ((bg_color[0] - r)**2 + (bg_color[1] - g)**2 + (bg_color[2] - b)**2)**0.5
        return dist < 20 # moderate tolerance for JPEG compression artifacts

    visited = set()
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    for start in queue:
        if is_bg(pixels[start[0], start[1]]):
            visited.add(start)
            
    print("Running BFS flood fill...")
    # Fast queue
    from collections import deque
    q = deque(visited)
    
    while q:
        x, y = q.popleft()
        for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
            if 0 <= nx < width and 0 <= ny < height:
                if (nx, ny) not in visited:
                    if is_bg(pixels[nx, ny]):
                        visited.add((nx, ny))
                        q.append((nx, ny))

    print(f"Total background pixels: {len(visited)} out of {width*height}")
    
    # Process edges and apply transparency
    print("Applying edges and transparency...")
    
    # Using a fast buffer for the whole image
    new_data = []
    
    # Faster way: put visited in a 2D boolean array or just keep using set lookup
    for y in range(height):
        for x in range(width):
            if (x, y) in visited:
                is_boundary = False
                for nx, ny in [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]:
                    if 0 <= nx < width and 0 <= ny < height:
                        if (nx, ny) not in visited:
                            is_boundary = True
                            break
                if is_boundary:
                    # boundary px - keep pixel details but reduce alpha
                    # Make it slightly anti-aliased based on dist
                    r, g, b, a = pixels[x, y]
                    # Map the color more towards a black fringe to avoid light halos?
                    # Since background is light and logo is black, a fringe is light grey. We can darken it.
                    dist = ((bg_color[0] - r)**2 + (bg_color[1] - g)**2 + (bg_color[2] - b)**2)**0.5
                    alpha = int(max(0, min(255, 255 - dist * 12))) # Rough heuristic
                    new_data.append((0, 0, 0, alpha)) 
                else:
                    new_data.append((255, 255, 255, 0))
            else:
                new_data.append(pixels[x, y])
                
    img.putdata(new_data)
    
    print(f"Saving to {output_path}...")
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print("Done!")

if __name__ == "__main__":
    remove_background("public/logo.png", "public/logo_transparent.png")
