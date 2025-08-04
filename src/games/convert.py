import chess.pgn
import chess
import random
from collections import defaultdict
import glob
import os
import json

def count_pieces(fen):
    """Count the number of pieces on the board from a FEN string"""
    board = chess.Board(fen)
    return sum(1 for _ in board.piece_map().values())

def categorize_piece_count(count):
    """Categorize piece count into groups"""
    if count < 4:
        return "low"
    elif 4 <= count <= 7:
        return "mid"
    else:
        return "high"

def get_category_label(category):
    """Get human-readable label for category"""
    labels = {
        "low": "easy",
        "mid": "normal",
        "high": "hard"
    }
    return labels.get(category, category)

def get_category_comment(category):
    """Get comment for category"""
    comments = {
        "low": "Less than 4 pieces",
        "mid": "4-7 pieces",
        "high": "More than 7 pieces"
    }
    return comments.get(category, category)

def all_groups_complete(groups):
    """Check if all groups have reached their targets"""
    return all(group["count"] >= group["target"] for group in groups.values())

def initialize_groups(num_positions):
    """Initialize the groups dictionary with targets"""
    positions_per_group = num_positions // 3
    remainder = num_positions % 3

    return {
        "low": {"count": 0, "target": positions_per_group + (1 if remainder > 0 else 0), "positions": []},
        "mid": {"count": 0, "target": positions_per_group + (1 if remainder > 1 else 0), "positions": []},
        "high": {"count": 0, "target": positions_per_group, "positions": []}
    }

def process_single_game(game, groups):
    """Process a single game and extract positions for needed groups"""
    board = game.board()
    moves = list(game.mainline_moves())

    # Skip games with too few moves
    if len(moves) < 10:
        return False

    # Track which groups we still need for this game
    needed_groups = {name: group for name, group in groups.items()
                   if group["count"] < group["target"]}

    if not needed_groups:
        return False

    found_groups = set()

    # Try to find positions for each needed group in this game
    available_moves = list(range(10, len(moves)))
    random.shuffle(available_moves)

    for move_num in available_moves:
        if len(found_groups) == len(needed_groups):
            break

        # Advance to the sampled move
        board.reset()
        for move in moves[:move_num]:
            board.push(move)

        # Get FEN and piece count
        fen = board.fen()
        piece_count = count_pieces(fen)
        category = categorize_piece_count(piece_count)

        # Check if this category is needed and not yet found in this game
        if (category in needed_groups and
            category not in found_groups and
            needed_groups[category]["count"] < needed_groups[category]["target"]):

            groups[category]["positions"].append((fen, piece_count))
            groups[category]["count"] += 1
            found_groups.add(category)

    return True

def extract_random_positions_from_files(pgn_files, num_positions=100):
    """Extract random positions from multiple PGN files"""
    groups = initialize_groups(num_positions)

    for pgn_file in pgn_files:
        if not os.path.exists(pgn_file):
            print(f"Warning: File {pgn_file} not found, skipping...")
            continue

        print(f"Processing {pgn_file}...")

        try:
            with open(pgn_file) as f:
                games_processed = 0
                while not all_groups_complete(groups):
                    game = chess.pgn.read_game(f)
                    if game is None:
                        break  # end of file

                    if process_single_game(game, groups):
                        games_processed += 1

                        # Print progress every 100 games
                        if games_processed % 100 == 0:
                            total_found = sum(g["count"] for g in groups.values())
                            print(f"  Processed {games_processed} games, found {total_found}/{num_positions} positions")

                print(f"  Finished {pgn_file}: processed {games_processed} games")

        except Exception as e:
            print(f"Error processing {pgn_file}: {e}")
            continue

        # Check if we have enough positions
        if all_groups_complete(groups):
            break

    # Combine all positions
    all_positions = []
    for group in groups.values():
        all_positions.extend(group["positions"])

    return all_positions

def group_positions_by_piece_count(positions):
    """Group positions into piece count categories using consistent logic"""
    groups = defaultdict(list)

    for fen, count in positions:
        category = categorize_piece_count(count)
        label = get_category_label(category)
        groups[label].append(fen)

    return groups

def find_pgn_files(pattern):
    """Find PGN files matching the given pattern"""
    return glob.glob(pattern)

def write_positions_to_js_file(grouped_positions, output_file):
    """Write grouped positions to a JavaScript file with variables"""
    with open(output_file, 'w') as f:
        f.write("// Chess positions grouped by piece count\n")
        f.write("// Generated automatically from PGN files\n\n")

        # Write each group as a separate JavaScript variable
        for var_name, fens in grouped_positions.items():
            category = None
            for cat in ["low", "mid", "high"]:
                if get_category_label(cat) == var_name:
                    category = cat
                    break

            comment = get_category_comment(category) if category else var_name
            f.write(f"// {comment} ({len(fens)} positions)\n")
            f.write(f"const {var_name} = [\n")

            for i, fen in enumerate(fens):
                # Add comma except for last item
                comma = "," if i < len(fens) - 1 else ""
                f.write(f'  "{fen}"{comma}\n')

            f.write("];\n\n")

def main(pgn_pattern="pgns/*.pgn", num_positions=100, output_file="../js/positions.js"):
    """Main function to extract positions from PGN files"""
    # Find PGN files
    pgn_files = find_pgn_files(pgn_pattern)

    if not pgn_files:
        print(f"No PGN files found matching pattern: {pgn_pattern}")
        return

    print(f"Found {len(pgn_files)} PGN files: {pgn_files}")

    # Extract positions
    random_positions = extract_random_positions_from_files(pgn_files, num_positions)

    if not random_positions:
        print("No positions extracted!")
        return

    # Group positions
    grouped_positions = group_positions_by_piece_count(random_positions)

    # Write results to JavaScript file
    write_positions_to_js_file(grouped_positions, output_file)

    print(f"Extracted {len(random_positions)} positions")
    for group, fens in grouped_positions.items():
        print(f"  {group}: {len(fens)} positions")
    print(f"Results written to {output_file}")

# Example usage
if __name__ == "__main__":
    # Process all PGN files in current directory
    main()
