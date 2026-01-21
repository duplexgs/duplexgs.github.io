def RequestFinalizer():
    """
    Halts execution to request user approval.
    Returns: (bool is_approved, str feedback_message)
    """
    try:
        import readline
    except ImportError:
        pass
    
    # ANSI Colors
    CYAN, GREEN, YELLOW, RED, RESET = "\033[96m", "\033[92m", "\033[93m", "\033[91m", "\033[0m"
    BOLD, DIM = "\033[1m", "\033[2m"
    W = 64
    
    def pad(text, width):
        import re, unicodedata
        visible = re.sub(r'\033\[[0-9;]*m', '', text)
        display_width = sum(2 if unicodedata.east_asian_width(c) in ('W', 'F') else 1 for c in visible)
        return text + ' ' * max(0, width - display_width)
    
    print(f"\n{CYAN}╔{'═'*W}╗{RESET}")
    print(f"{CYAN}║{RESET}{pad(f'  {BOLD}🤖 AGENT CHECKPOINT{RESET}', W)}{CYAN}║{RESET}")
    print(f"{CYAN}╠{'═'*W}╣{RESET}")
    print(f"{CYAN}║{RESET}{pad('  The agent is waiting for your input.', W)}{CYAN}║{RESET}")
    print(f"{CYAN}║{RESET}{pad(f'  {GREEN}OK{RESET}     - Approve & Continue/Exit', W)}{CYAN}║{RESET}")
    print(f"{CYAN}║{RESET}{pad(f'  {YELLOW}REJECT{RESET} - Request changes (type feedback first)', W)}{CYAN}║{RESET}")
    print(f"{CYAN}║{RESET}{pad(f'  {RED}END{RESET}    - Force Stop', W)}{CYAN}║{RESET}")
    print(f"{CYAN}╚{'═'*W}╝{RESET}\n")

    feedback_buffer = []
    
    while True:
        try:
            line = input(f"{CYAN}>{RESET} ")
            cmd = line.strip().upper()
            
            if cmd == 'OK':
                return False, "\n".join(feedback_buffer)
            if cmd == 'REJECT':
                return False, "\n".join(feedback_buffer)
            if cmd == 'END':
                return True, "SESSION_ENDED_BY_USER"
            
            feedback_buffer.append(line)
        except EOFError:
            return False, "Stream interrupted. Retrying."
            
if __name__ == "__main__":
    status, msg = RequestFinalizer()
    print(f"FINALIZER_STATUS={status}")
    print(f"FINALIZER_FEEDBACK={msg}")
