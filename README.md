# FotF & Perilous Winds generator
In-game entities generator for "Perilous Winds" RPG Ruleset

# Data file format
Written in JSON format

[
 {
   "tag": "entity_tag",
   "title" : "Entity Title",
   "dice": "d12+1",
   "variants": [
    {
        "tag": "variant_tag",
        "title": "Variant Tag",
        "min": 2,
        "max": 13,
        "generate_outer": "outer_entity_tag"
        "variants": [],
        "dictionaries": []
        "additional": [
            "outer_entity_tag",
            "another_outer_entity_tag.second_level_entity_tag"
        ],
        "optional": [
            "outer_entity_tag",
            "another_outer_entity_tag.second_level_entity_tag"
        ],
        "template": []
    }
   ]
 }
]