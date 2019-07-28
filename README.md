# FotF & Perilous Winds generator
In-game entities generator for "Perilous Winds" RPG Ruleset

## Data file format
File should be written in JSON format and placed under /data directory

    [
     {
        // REQUIRED - inner identificator, used in entity path,
        // can be omitted only when you generate entity by outer link or by "static" field
        // only lowercase latin characters, digits and underscore symbol
        "tag": "entity_tag",
        // If set - used as generated entity title, if not - tag is used
        "title" : "Entity Title",
        // Hint for pop-up near entity name
        "hint": "Use it wisely",
        // If set and set as true - this entity will be hidden from entity tree
        "hide" : true,
        // dice formula, used for getting value for variants generation
        "dice": "d12+1",
        // If set as true, modified from field MOD will be applied to dice formula AFTER roll
        "use_modifier"; true,
        // If set, dice formula from Roll field will be used instead of formula from "dice"
        "use_custom_dice" : true,
        // Static value to be returned instead of generation with dice
        "static": "Always one value",
        // Array of entity variants for generation. 
        // all entities lower that top-levelcan have additional fields
        "variants": [
        {
            "tag": "variant_tag",
            "title": "Variant Tag",
            // minimal value on dice for this variant
            "min": 2,
            // maximal value on dice for this variant
            "max": 13,
            // Path to other entity. 
            // If set, instead of generating this entity, other entity fill be found and generated.
            // Used for gemerate similar entities in different places
            "generate_outer": "outer_entity_tag",
            // If set, number will be rolled and returned
            "roll_result": "2d4+5",
            // DEPRECATED - for ol data files only, use "static" or "roll_result" instead
            "numbers": 1
            // Variant of next-level entity and etc.
            "variants": [],
        }
        ],
        // Array of entities, that will not be generated automatically, 
        //but can be used to direct generation by path
        "dictionaries": [
        ]
        // Array of links or entties, that shoud be generated alongside with variant
        "additional": [
            "outer_entity_tag",
            "another_outer_entity_tag.second_level_entity_tag",
            {
                "tag": "more_complex_entity",
               "static": "you can write any common entity here"
            }
        ],
        // DEPRECATED - another array, similar to adiitional, 
        // use entitiy with repeat at "additional" instead
        "optional": [
            "outer_entity_tag",
            "another_outer_entity_tag.second_level_entity_tag"
        ],
        // Array of entities, that return plain strings, that will bw concatenated in one string
        // mainly used for generation of complex names for locations
        "template": [
              {
                "static": "The"
              },
              {
                "generate_outer": "dungeon.name_place"
              }
        ],
        // If set and entity is part of template - concatenate entity as part of previous word
        "concatenate": true
        // If set, entity will be generated multiple times, dice formula or integer
        "repeat": "2d3",
        // Array of varialbles, currently can be used only to create dynamic paths
        // Each variable name must start with "$" symbol
        "vars": {
            "$some_var_name": "some_var_value"
        }
     }
    ]

## Dice formula

Engine can use dice formula by provided format. 

    {x}d{y}+{z}x{a}
    
    x - number of dice rolled
    y - number of dice sides
    z - static modifier, that is added to roll result
    a - static modifier, by which roll result will be multiplied (ATFER adding z)
    
Notice, that ALL parts of formula are arbitrary and minimal formula 
is one number (in that case, that number will be always returned as rolled value).    
    
All of variants are valid:

    1
    2+1
    2d4
    2d4+1
    d3+1x3
    1x3
    
## Entity path

Engine will search entities by link in "variants" and "dictionaries" sections by their tags. 
Links must be provided in string format, composed of tags, separated by dot

    first_lvel_entity.entity_from_variants.third_level_entity
    
Entities can be stored on infinite depth, so entity path can be eny length.