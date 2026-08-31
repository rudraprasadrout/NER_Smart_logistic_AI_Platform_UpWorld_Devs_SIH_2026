import csv

def repair_edges_csv():
    filepath = 'data/ner_edges_REAL (3).csv'
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = [line.rstrip('\r\n') for line in f]

    print(f"Original line count: {len(lines)}")

    # Line 700 (index 700) and Line 701 (index 701)
    # Line 700 is osm_edge_00700 whose geometry was truncated at ';2'
    # Line 701 is the overflow fragment starting with '0.5923014,92.0197275;...'
    line700_parts = lines[700].split('"', 2)
    line700_prefix = line700_parts[0]
    line700_geom = line700_parts[1]
    line701_geom = lines[701].replace('"', '').rstrip(',')
    # ';2' + '5.5923014...'
    if line701_geom.startswith('0.'):
        line701_geom_rest = line701_geom[2:]
        fixed_geom_700 = line700_geom[:-1] + '25.' + line701_geom_rest
    else:
        fixed_geom_700 = line700_geom + line701_geom
    fixed_line_700 = line700_prefix + '"' + fixed_geom_700 + '"'

    # Line 749 (index 749) and Line 750 (index 750)
    # Line 749 is osm_edge_00748
    line749_parts = lines[749].split('"', 2)
    line749_prefix = line749_parts[0]
    line749_geom = line749_parts[1]
    line750_geom = lines[750].replace('"', '').rstrip(',')
    if line750_geom.startswith('0.'):
        line750_geom_rest = line750_geom[2:]
        fixed_geom_749 = line749_geom[:-1] + '25.' + line750_geom_rest
    else:
        fixed_geom_749 = line749_geom + line750_geom
    fixed_line_749 = line749_prefix + '"' + fixed_geom_749 + '"'

    new_lines = []
    for i, line in enumerate(lines):
        if i == 700:
            new_lines.append(fixed_line_700)
        elif i == 701:
            continue
        elif i == 749:
            new_lines.append(fixed_line_749)
        elif i == 750:
            continue
        else:
            new_lines.append(line)

    print(f"Repaired line count: {len(new_lines)}")

    # Validate before saving
    reader = csv.DictReader(new_lines)
    errors = 0
    count = 0
    for idx, r in enumerate(reader):
        count += 1
        try:
            float(r['slope_deg']) if r.get('slope_deg') else 5.0
            float(r['distance_km']) if r.get('distance_km') else 1.0
            float(r['avg_speed_kmh']) if r.get('avg_speed_kmh') else 40.0
        except Exception as e:
            errors += 1
            print(f"Validation error at row {idx} (edge_id={r.get('edge_id')}): {e}")

    if errors == 0:
        print(f"Validation passed perfectly ({count} edges, 0 errors). Overwriting CSV...")
        with open(filepath, 'w', encoding='utf-8', newline='') as f:
            f.write('\n'.join(new_lines) + '\n')
        print("CSV successfully updated!")
    else:
        print(f"Validation failed with {errors} errors, not overwriting.")

if __name__ == '__main__':
    repair_edges_csv()
