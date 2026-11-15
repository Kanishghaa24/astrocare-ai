import csv
import random

def generate_sample_osd575(file_path: str):
    """
    Generates a realistic reference subset based on NASA OSDR Inspiration4 OSD-575 study:
    'Single-cell RNA-seq and immune repertoire profiling of SpaceX Inspiration4 crew'.
    Includes biological parameters (cytokine markers, gene expression TPM, cell viability, flight phase).
    """
    fieldnames = [
        "Sample_ID", "Crew_Member", "Flight_Phase", "Cell_Type", 
        "IL6_Cytokine_pg_mL", "TNF_alpha_pg_mL", "CD4_T_Count", "CD8_T_Count", 
        "Mitochondrial_DNA_Copy_Num", "Cell_Viability_Pct", "Microgravity_Duration_Days"
    ]
    
    phases = ["Pre-Flight (L-30)", "Flight Mid-Mission (FD2)", "Flight Landing (FD3)", "Post-Flight (R+1)", "Post-Flight (R+45)"]
    crew_members = ["I4-Crew-Alpha", "I4-Crew-Bravo", "I4-Crew-Charlie", "I4-Crew-Delta"]
    cell_types = ["PBMC", "CD4+ T-cell", "CD8+ T-cell", "B-cell", "NK-cell", "Monocyte"]

    rows = []
    sample_counter = 1001

    for crew in crew_members:
        for phase in phases:
            for c_type in cell_types:
                # Biological variance
                is_flight = "Flight" in phase
                il6 = round(random.uniform(3.5, 9.8) if is_flight else random.uniform(1.2, 3.4), 2)
                tnf = round(random.uniform(4.0, 12.5) if is_flight else random.uniform(1.5, 4.2), 2)
                cd4 = random.randint(650, 1100) if not is_flight else random.randint(480, 850)
                cd8 = random.randint(350, 700) if not is_flight else random.randint(280, 520)
                mt_dna = round(random.uniform(1.8, 3.4) if is_flight else random.uniform(1.0, 1.8), 2)
                viability = round(random.uniform(94.0, 99.5), 1)
                duration = 3 if is_flight else (0 if "Pre" in phase else 3)

                rows.append({
                    "Sample_ID": f"OSD-575-SMP-{sample_counter}",
                    "Crew_Member": crew,
                    "Flight_Phase": phase,
                    "Cell_Type": c_type,
                    "IL6_Cytokine_pg_mL": il6,
                    "TNF_alpha_pg_mL": tnf,
                    "CD4_T_Count": cd4,
                    "CD8_T_Count": cd8,
                    "Mitochondrial_DNA_Copy_Num": mt_dna,
                    "Cell_Viability_Pct": viability,
                    "Microgravity_Duration_Days": duration
                })
                sample_counter += 1

    with open(file_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

if __name__ == "__main__":
    generate_sample_osd575("C:/Users/Kanishghaa/.gemini/antigravity/scratch/astrocare-ai/backend/data/NASA_OSD_575_Inspiration4_sample.csv")
