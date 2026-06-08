import copy
from typing import List, Tuple
from .detector import DetectorConfig
from .schemas import RuleTuningOverride

def validate_rule_overrides(overrides: RuleTuningOverride) -> List[str]:
    """
    Validates rule overrides and returns a list of warning messages.
    """
    warnings = []

    if overrides.high_frequency_threshold is not None and overrides.high_frequency_threshold < 1:
        warnings.append("high_frequency_threshold must be >= 1. Using default.")

    if overrides.path_scanning_404_threshold is not None and overrides.path_scanning_404_threshold < 1:
        warnings.append("path_scanning_404_threshold must be >= 1. Using default.")

    if overrides.sensitive_paths is not None:
        for path in overrides.sensitive_paths:
            if not path.startswith("/"):
                warnings.append(f"Sensitive path '{path}' must start with '/'. It will be ignored.")

    if overrides.disabled_rules:
        known_rules = {"high_frequency_ip", "path_scanning", "sensitive_path_probe", "suspicious_user_agent"}
        for rule_id in overrides.disabled_rules:
            if rule_id not in known_rules:
                warnings.append(f"Unknown rule_id '{rule_id}' in disabled_rules. It will be ignored.")

    return warnings

def apply_rule_overrides(config: DetectorConfig, overrides: RuleTuningOverride) -> DetectorConfig:
    """
    Applies overrides to a copy of the configuration.
    Does not modify the original config.
    """
    new_config = copy.deepcopy(config)

    if overrides.high_frequency_threshold is not None and overrides.high_frequency_threshold >= 1:
        new_config.freq_threshold = overrides.high_frequency_threshold

    if overrides.path_scanning_404_threshold is not None and overrides.path_scanning_404_threshold >= 1:
        new_config.scan_threshold = overrides.path_scanning_404_threshold

    if overrides.sensitive_paths is not None:
        valid_paths = {p for p in overrides.sensitive_paths if p.startswith("/")}
        if valid_paths:
            new_config.sensitive_paths = valid_paths

    if overrides.suspicious_user_agents is not None:
        valid_uas = {ua for ua in overrides.suspicious_user_agents if ua.strip()}
        if valid_uas:
            new_config.suspicious_ua_keywords = valid_uas

    if overrides.disabled_rules:
        known_rules = {"high_frequency_ip", "path_scanning", "sensitive_path_probe", "suspicious_user_agent"}
        valid_disabled = {r for r in overrides.disabled_rules if r in known_rules}
        new_config.disabled_rules = valid_disabled

    return new_config
